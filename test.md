# Test DNS resolution from your EC2 or container
dig api.delivergate.com
nslookup api.delivergate.com

# Trace the full resolution path
dig +trace api.delivergate.com
```

---

## Lesson 2: DNS Record Types

| Record | Purpose | Example |
|---|---|---|
| **A** | Domain → IPv4 address | `api.delivergate.com → 13.214.55.102` |
| **AAAA** | Domain → IPv6 address | `api.delivergate.com → 2600:1f18::1` |
| **CNAME** | Domain → another domain | `www.delivergate.com → delivergate.com` |
| **MX** | Mail server for domain | `delivergate.com → mail.google.com` |
| **TXT** | Arbitrary text (SPF, verification) | `"v=spf1 include:sendgrid.net"` |
| **SRV** | Service location (host + port) | Used by Kubernetes, SIP, etc. |
| **PTR** | IP → Domain (reverse DNS) | `13.214.55.102 → api.delivergate.com` |
| **NS** | Which nameservers are authoritative | `delivergate.com → ns-123.awsdns.com` |
| **SOA** | Start of Authority, zone metadata | TTLs, admin email, serial number |

### A vs CNAME — The Key Distinction
```
A Record:      api.delivergate.com  →  13.214.55.102  (direct IP)
CNAME Record:  www.delivergate.com  →  api.delivergate.com  (alias)
```

**Critical rule:** You **cannot** use a CNAME at the zone apex (root domain).
```
✅  www.delivergate.com  CNAME  →  api.delivergate.com
❌  delivergate.com      CNAME  →  anything   (not allowed)
```

This is why Route 53 invented the **Alias record** — it behaves like a CNAME but works at the root, and it's free for AWS resources (ALB, CloudFront, S3).

### TTL — Time To Live

TTL is how long (in seconds) a resolver caches the answer.
```
TTL 300   = cached for 5 minutes
TTL 3600  = cached for 1 hour
TTL 86400 = cached for 1 day
```

**DevOps implications:**
```
Doing a deployment / IP change?
→ Lower TTL to 60 BEFORE the change (wait for old TTL to expire)
→ Make the change
→ Raise TTL back up after

If you don't do this, some users will hit old IPs for hours.
```

### SRV Records (Important for microservices)

SRV records encode **both host and port**:
```
_service._proto.name  TTL  IN  SRV  priority  weight  port  target

_grpc._tcp.auth.delivergate.com  300  IN  SRV  10  20  50051  auth-svc.internal
```

Kubernetes service discovery and some microservice frameworks use these heavily.

---

## Lesson 3: Route 53 In Depth

Route 53 is AWS's DNS service. It's authoritative for your domains and integrates deeply with AWS resources.

### Hosted Zones

A **Hosted Zone** is a container for DNS records for a domain.
```
Public Hosted Zone   → answers DNS queries from the internet
Private Hosted Zone  → answers DNS queries only within your VPC
```

You almost certainly use both at Delivergate:
- Public zone: `delivergate.com` (user-facing)
- Private zone: `internal.delivergate.com` (service-to-service inside VPC)

### Route 53 Record Types (beyond standard DNS)

**Alias Records** — AWS-specific, maps to AWS resources directly:
```
delivergate.com  →  ALIAS  my-alb-123.ap-southeast-1.elb.amazonaws.com
```
Free, auto-updates if ALB IP changes, works at zone apex.

**Routing Policies** — this is where Route 53 gets powerful:
```
┌─────────────────┬──────────────────────────────────────────────┐
│ Policy          │ Use Case                                     │
├─────────────────┼──────────────────────────────────────────────┤
│ Simple          │ One record, one IP. Default.                 │
│ Weighted        │ 80% traffic to v2, 20% to v1 (canary deploy)│
│ Latency         │ Route users to lowest-latency region         │
│ Failover        │ Primary/secondary, auto failover on health   │
│ Geolocation     │ Users in EU → EU servers                     │
│ Multivalue      │ Return multiple IPs, basic load balancing    │
└─────────────────┴──────────────────────────────────────────────┘
```

### Health Checks

Route 53 can check if your endpoints are healthy and **automatically remove unhealthy records**:
```
Route 53 Health Check
    │
    ├── HTTP check on port 80/443 every 30s
    ├── TCP check on any port
    └── CloudWatch alarm-based check

If unhealthy → Route 53 stops routing to that endpoint
```

This pairs with **Failover routing** for automatic disaster recovery.

### Real-World Pattern at Delivergate
```
User hits delivergate.com
    ↓
Route 53 (Latency routing) → closest region ALB
    ↓
ALB → ECS containers
    ↓
Container resolves internal.delivergate.com (Private Hosted Zone)
    → RDS endpoint, Redis, other microservices
```

---

## Lesson 4: Load Balancing

### What Is Load Balancing?

Distributing incoming traffic across multiple servers so no single server is overwhelmed.
```
                    ┌─── EC2 / Container 1
Client → Load Balancer ├─── EC2 / Container 2
                    └─── EC2 / Container 3
```

Benefits: high availability, scalability, zero-downtime deploys.

### Load Balancing Algorithms

| Algorithm | How It Works | Best For |
|---|---|---|
| **Round Robin** | Request 1→server1, 2→server2, 3→server3, repeat | Uniform servers, simple APIs |
| **Least Connections** | Send to server with fewest active connections | Long-lived connections, WebSockets |
| **Weighted Round Robin** | Server A gets 3x traffic of Server B | Canary deploys, mixed instance sizes |
| **IP Hash** | Same client IP always hits same server | Session stickiness |
| **Random** | Random server each time | Simple, works well at scale |

AWS ALB uses **round robin** by default. You can enable **least outstanding requests** for uneven workloads.

---

## Lesson 5: ALB vs NLB vs CLB

### Classic Load Balancer (CLB) — Legacy
The old one. Avoid for new projects. Being phased out. Operates at Layer 4 and Layer 7 but poorly.

### Application Load Balancer (ALB) — Layer 7

Understands **HTTP/HTTPS**. Most intelligent, most features.
```
ALB can route based on:
├── Path:    /api/*  → API service
│            /admin/* → Admin service
├── Host:    api.delivergate.com → API containers
│            admin.delivergate.com → Admin containers
├── Headers: X-Version: v2 → new containers
├── Query:   ?preview=true → staging containers
└── Method:  POST → write service, GET → read replica
```

**Use ALB when:** HTTP/HTTPS traffic, microservices, need path-based routing, ECS/Fargate, WebSockets, gRPC.

This is what you're using for your Delivergate services.

### Network Load Balancer (NLB) — Layer 4

Operates at the TCP/UDP level. Doesn't understand HTTP at all — just raw packets.
```
Pros:
✅ Extremely high performance (millions of req/sec)
✅ Ultra-low latency (~100μs)
✅ Preserves client IP address
✅ Static IP address (important for whitelisting)
✅ Handles TCP, UDP, TLS

Cons:
❌ No HTTP routing rules
❌ No path-based routing
❌ More expensive per hour
```

**Use NLB when:** non-HTTP traffic (databases, game servers, IoT), need static IP, need to preserve client IP, extreme performance requirements.

### Side-by-Side Comparison
```
┌─────────────────┬──────────────────┬──────────────────┐
│                 │      ALB         │      NLB         │
├─────────────────┼──────────────────┼──────────────────┤
│ OSI Layer       │ Layer 7 (HTTP)   │ Layer 4 (TCP)    │
│ Protocols       │ HTTP, HTTPS, WS  │ TCP, UDP, TLS    │
│ Routing Rules   │ Path, host, hdrs │ None             │
│ Static IP       │ ❌               │ ✅               │
│ Client IP       │ X-Forwarded-For  │ Preserved        │
│ Performance     │ High             │ Extreme          │
│ Cost            │ Lower            │ Higher           │
│ Health Checks   │ HTTP aware       │ TCP only         │
│ Best For        │ Web/microservices│ Non-HTTP, IoT    │
└─────────────────┴──────────────────┴──────────────────┘
```

### Target Groups

Both ALB and NLB route to **Target Groups** — a group of destinations:
```
Target Group types:
├── Instance (EC2)
├── IP (containers, on-prem, cross-VPC via PrivateLink)
└── Lambda

Health check per target group:
└── ALB: HTTP 200 on /health every 30s
    NLB: TCP connection every 10s
```

For your ECS setup, each service typically has its own target group, and the ALB routes to them by path or hostname.

---

## The Full Picture Together
```
User: GET https://api.delivergate.com/orders

1. DNS: Route 53 resolves api.delivergate.com → ALB DNS name
        ALB DNS → multiple IPs (multi-AZ)

2. TLS: ALB terminates HTTPS (your cert lives here)

3. ALB routing rule:
   /orders* → Target Group: orders-service (ECS tasks)

4. ALB picks healthy ECS task (round robin)
   → forwards to container on port 3000

5. Container resolves db.internal.delivergate.com
   → Private Hosted Zone → RDS endpoint

6. Response travels back, ALB forwards to user