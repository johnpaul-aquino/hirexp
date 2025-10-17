# Scenario Management System Documentation

## Overview

The Scenario Management System is a comprehensive content management platform that enables non-technical users to create, edit, and manage AI Mock Call scenarios. This system transforms scenario creation from a developer-dependent bottleneck into a scalable, user-friendly process.

## Documentation Structure

### 📋 [Overview](./overview.md)
**Complete feature specification and business requirements**

**Contents:**
- Executive summary and business objectives
- User personas and workflows
- Feature scope (MVP + future phases)
- Success metrics and KPIs
- Implementation timeline
- Risk mitigation strategies

**Key Highlights:**
- 500+ scenarios planned without code deployments
- B2B customization capabilities
- A/B testing framework
- Multi-tenant support

### 🔧 [Technical Specification](./technical-spec.md)
**Detailed technical architecture and implementation**

**Contents:**
- System architecture diagrams
- Complete database schema (Prisma)
- Service layer implementation
- Performance optimization strategies
- Security and permissions
- Caching strategies
- Testing approach

**Key Components:**
- `ScenarioService` - Core business logic
- `VersionService` - Version control
- `AnalyticsService` - Performance tracking
- `ScenarioCache` - Multi-layer caching

### 🌐 [API Design](./api-design.md)
**Complete API reference documentation**

**Contents:**
- All CRUD endpoints
- Request/response examples
- Query parameters
- Error codes and handling
- Rate limiting
- Bulk operations
- Webhooks (future)

**Endpoints:**
- 25+ REST endpoints
- WebSocket for real-time updates
- Bulk import/export
- Analytics APIs

## Quick Start

### For Developers

1. **Review the Technical Spec** to understand the architecture
2. **Check the Database Schema** in technical-spec.md (line 15-365)
3. **Implement Core Services** following the provided code examples
4. **Use API Design** as the contract for frontend/backend integration

### For Product Managers

1. **Start with Overview** to understand business value
2. **Review User Personas** to understand target users
3. **Check Success Metrics** to define KPIs
4. **Use Implementation Timeline** for project planning

### For Frontend Developers

1. **Read API Design** for endpoint specifications
2. **Check UI Components** in overview.md (line 250-300)
3. **Review User Flows** for interaction patterns
4. **Implement against API contracts**

## Key Features by Phase

### Phase 1: MVP (Weeks 1-4)
✅ Core CRUD operations
✅ Basic admin UI
✅ Search and filter
✅ Role-based permissions
✅ Scenario preview

**Implementation Priority:** P0 (Must Have)

### Phase 2: Enhanced (Weeks 5-8)
✅ Version control
✅ Template system
✅ Import/export
✅ Analytics dashboard
✅ AI-assisted generation

**Implementation Priority:** P1 (Should Have)

### Phase 3: B2B Features (Weeks 9-12)
✅ Multi-tenant isolation
✅ Custom branding
✅ Private libraries
✅ A/B testing
✅ Advanced analytics

**Implementation Priority:** P2 (Nice to Have)

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│            Admin UI (React)                 │
│   ScenarioBuilder | List | Analytics       │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│         API Layer (Next.js)                 │
│    Auth | RBAC | Validation | Rate Limit   │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│         Service Layer                       │
│  ScenarioService | VersionService | AI      │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│         Data Layer                          │
│  PostgreSQL | Redis | Cloudinary           │
└─────────────────────────────────────────────┘
```

## Database Schema Summary

**Core Tables:**
- `scenarios` - Main scenario data
- `scenario_versions` - Version history
- `scenario_analytics` - Performance metrics
- `scenario_comments` - Collaboration
- `scenario_templates` - Reusable templates
- `audit_logs` - Change tracking
- `scenario_tests` - A/B testing

See [Technical Spec](./technical-spec.md#database-schema) for complete schema.

## API Endpoints Summary

### Scenarios
```
POST   /admin/scenarios              # Create
GET    /admin/scenarios              # List
GET    /admin/scenarios/:id          # Get
PUT    /admin/scenarios/:id          # Update
DELETE /admin/scenarios/:id          # Delete
```

### Operations
```
POST   /admin/scenarios/:id/publish
POST   /admin/scenarios/:id/duplicate
POST   /admin/scenarios/:id/archive
POST   /admin/scenarios/search
```

### Bulk
```
POST   /admin/scenarios/bulk/import
POST   /admin/scenarios/bulk/export
PATCH  /admin/scenarios/bulk/update
```

See [API Design](./api-design.md) for complete reference.

## Technology Stack

### Backend
- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL 15 with Prisma ORM
- **Cache:** Redis (Upstash)
- **Storage:** Cloudinary
- **Authentication:** NextAuth.js with JWT

### Frontend
- **UI Framework:** React 19
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Components:** shadcn/ui + MagicUI
- **Forms:** React Hook Form + Zod

### DevOps
- **Hosting:** Vercel
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry + Vercel Analytics

## Security & Permissions

### Role-Based Access Control

| Role | Create | Read | Update | Delete | Publish |
|------|--------|------|--------|--------|---------|
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Content Manager | ✅ | ✅ | ✅ | ❌ | ❌ |
| Reviewer | ❌ | ✅ | ❌ | ❌ | ✅ |
| Viewer | ❌ | ✅ | ❌ | ❌ | ❌ |

### Security Features
- JWT authentication with refresh tokens
- Rate limiting per endpoint
- Audit logging for all actions
- Input validation with Zod
- SQL injection prevention
- XSS protection
- CSRF tokens

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Page Load | < 2s | TBD |
| API Response (p95) | < 500ms | TBD |
| Database Query | < 100ms | TBD |
| Cache Hit Rate | > 80% | TBD |
| Uptime | > 99.9% | TBD |

## Success Metrics

### Business KPIs
- 500+ scenarios created in 6 months
- 90% reduction in developer time
- 50+ content creators onboarded
- 5+ B2B clients with custom content
- $50K+ custom content revenue

### Technical KPIs
- < 1s scenario save time
- < 2s admin panel load
- 99.9% API uptime
- < 1% error rate
- 1000+ scenarios supported

### User Satisfaction
- 4.5/5 creator satisfaction
- < 15min to create scenario
- 90% publish without revision
- < 5% reported issues

## Implementation Checklist

### Phase 1 (MVP) - Week 1-4

#### Week 1-2: Foundation
- [ ] Database schema implementation
- [ ] Prisma migrations
- [ ] Basic CRUD API endpoints
- [ ] Authentication & RBAC
- [ ] Simple admin UI shell

#### Week 3-4: Core Features
- [ ] Scenario builder form
- [ ] List with search/filter
- [ ] Preview functionality
- [ ] Basic permissions
- [ ] Version control basics

### Phase 2 (Enhanced) - Week 5-8

#### Week 5-6: Advanced Operations
- [ ] Full version control
- [ ] Template system
- [ ] Import/export
- [ ] Bulk operations
- [ ] Advanced search

#### Week 7-8: Analytics & Collaboration
- [ ] Analytics dashboard
- [ ] Comments system
- [ ] Review workflow
- [ ] AI-assisted generation
- [ ] Performance optimization

### Phase 3 (B2B) - Week 9-12

#### Week 9-10: Multi-tenancy
- [ ] Tenant isolation
- [ ] Custom branding
- [ ] Private libraries
- [ ] White-labeling

#### Week 11-12: Advanced Features
- [ ] A/B testing framework
- [ ] Advanced analytics
- [ ] Reporting tools
- [ ] API webhooks

## Code Examples

### Creating a Scenario (Service)

```typescript
import { scenarioService } from '@/lib/services/scenario-service'

const scenario = await scenarioService.create({
  name: "Billing Dispute",
  category: "BILLING_PAYMENTS",
  difficulty: "INTERMEDIATE",
  customerProfile: {
    name: "Robert Johnson",
    age: 45,
    personality: ["assertive"]
  },
  aiConfig: {
    systemPrompt: "You are Robert...",
    temperature: 0.8
  }
}, userId)
```

### Fetching Scenarios (API)

```typescript
// GET /admin/scenarios?status=PUBLISHED&category=BILLING
const response = await fetch('/api/admin/scenarios?status=PUBLISHED')
const { data, pagination } = await response.json()
```

### Using in Frontend

```typescript
import { useScenarios } from '@/hooks/use-scenarios'

function ScenarioList() {
  const { data, isLoading } = useScenarios({
    status: 'PUBLISHED',
    page: 1
  })

  return (
    <div>
      {data?.scenarios.map(scenario => (
        <ScenarioCard key={scenario.id} scenario={scenario} />
      ))}
    </div>
  )
}
```

## Testing Strategy

### Unit Tests (70%)
- Service layer logic
- Validation functions
- Utility functions
- Business logic

### Integration Tests (20%)
- API endpoints
- Database operations
- External services
- Authentication

### E2E Tests (10%)
- Critical user flows
- Scenario creation
- Publishing workflow
- Search & filter

## Migration Path

### Seeding Initial Scenarios

```typescript
// scripts/seed-scenarios.ts
import scenarios from '@/.docs/.features/ai-mock-call/scenarios.json'

for (const scenario of scenarios) {
  await scenarioService.create(scenario, 'system')
}
```

### Migrating from Static to Dynamic

1. Export existing scenarios from code
2. Import via bulk import API
3. Verify all scenarios loaded
4. Update main app to fetch from API
5. Remove static scenario files

## Monitoring & Observability

### Metrics to Track
- Scenario creation rate
- Average creation time
- Error rates per endpoint
- Cache hit rates
- API response times
- User engagement

### Alerts
- High error rate (> 1%)
- Slow API responses (> 500ms p95)
- Low cache hit rate (< 80%)
- Failed imports/exports
- Authentication failures

## Support & Maintenance

### Documentation Updates
- Update after major features
- Review quarterly
- Version control
- Change logs

### User Training
- Admin onboarding guide
- Video tutorials
- Template library
- Best practices

## Troubleshooting

### Common Issues

**Scenario not saving:**
- Check validation errors
- Verify permissions
- Check network connectivity
- Review audit logs

**Search not working:**
- Verify database indexes
- Check search syntax
- Review filter combinations
- Clear cache

**Import failing:**
- Validate file format
- Check for duplicate slugs
- Verify required fields
- Review error report

## Resources

### Internal Links
- [Main Documentation](../../README.md)
- [API Routes](../../../app/api/admin/scenarios/)
- [UI Components](../../../components/admin/)

### External Resources
- [Prisma Documentation](https://prisma.io/docs)
- [Next.js 15 Guide](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## Contributing

### Adding New Features
1. Update documentation first
2. Design API contract
3. Implement backend service
4. Add API endpoints
5. Build frontend UI
6. Write tests
7. Update this README

### Code Review Checklist
- [ ] Follows coding standards
- [ ] Has unit tests
- [ ] Documentation updated
- [ ] API design reviewed
- [ ] Security considerations
- [ ] Performance impact assessed

## Contact & Support

**Technical Questions:**
- Review technical-spec.md
- Check API documentation
- Search audit logs

**Business Questions:**
- Review overview.md
- Check success metrics
- Consult product team

**Implementation Help:**
- Follow code examples
- Check existing services
- Review similar features

---

## Quick Reference

### Key Files
```
.docs/.features/scenario-management/
├── README.md              # This file
├── overview.md            # Business requirements
├── technical-spec.md      # Technical details
└── api-design.md          # API reference
```

### Key Concepts
- **Scenario:** Training simulation configuration
- **Version:** Historical snapshot of scenario
- **Template:** Reusable scenario blueprint
- **Tenant:** Organization with isolated scenarios
- **RBAC:** Role-based access control

### Getting Help
1. Check this README
2. Review specific doc (overview, technical, API)
3. Search code examples
4. Check existing implementations

---

*Documentation Version: 1.0*
*Created: October 2025*
*Maintained by: Product & Engineering Teams*
*Last Updated: October 2025*
