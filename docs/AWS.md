# AWS Architecture & Integration Guide — OmniCare Mesh

> **Mini Challenge:** AWS Builder  
> **Deployment Target:** AWS App Runner / Amazon ECS with Streamable HTTP & Server-Sent Events (SSE)

---

## 1. AWS Deployment Topology

```
                  Internet / Caregivers & Voice Agents
                                   │
                                   ▼
                      AWS CloudFront (HTTPS CDN)
                     ┌─────────────┴─────────────┐
                     ▼                           ▼
          Amazon S3 (Static Web)         AWS App Runner / ECS Fargate
        React + Vite SPA Bundle          Fullstack Node / TS Server
                                                 │
                                                 ├── POST /mcp (JSON-RPC 2.0)
                                                 └── GET /api/sim/stream (SSE)
                                                 │
                                                 ▼
                                     Amazon DynamoDB / RDS Aurora
                                       Append-only Hash-Chained
                                              Audit Log
```

### Why AWS App Runner / ECS Fargate?
1. **Long-Lived HTTP Streaming (SSE & Streamable HTTP):**  
   The Model Context Protocol (MCP) Streamable HTTP transport specification requires continuous chunked transfer or Server-Sent Events. AWS App Runner natively supports streaming responses over HTTP/1.1 and HTTP/2 without premature connection termination.
2. **Predictable Latency & Scale-to-Zero:**  
   Elder check-ins happen in bursts (morning, afternoon, evening). App Runner scales seamlessly while keeping minimal baseline latency.

---

## 2. Infrastructure as Code (AWS CloudFormation / CDK)

```typescript
import * as cdk from 'aws-cdk-lib';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class OmniCareMeshStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Audit Log Table with Hash Index
    const auditTable = new dynamodb.Table(this, 'AuditChainTable', {
      partitionKey: { name: 'runId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'index', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true, // Immutability guarantee
    });

    // 2. App Runner Service
    const service = new apprunner.Service(this, 'OmniCareService', {
      source: apprunner.Source.fromEcr({
        imageRepository: /* ecr repo */,
        tagOrDigest: 'latest',
      }),
      cpu: apprunner.Cpu.ONE_VCPU,
      memory: apprunner.Memory.TWO_GB,
    });

    auditTable.grantReadWriteData(service);
  }
}
```

---

## 3. Streaming Verification on AWS

- **Keep-Alive Configuration:** Server sets `res.setHeader('Connection', 'keep-alive')` and `res.flushHeaders()` so intermediate AWS proxies do not buffer SSE frames.
- **Port:** Configured to port 3000 matching AWS container defaults.
- **Health Checks:** App Runner probes `GET /api/health` every 10 seconds.
