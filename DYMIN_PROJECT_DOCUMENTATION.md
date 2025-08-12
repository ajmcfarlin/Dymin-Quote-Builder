# Dymin Quote Calculator - Project Documentation

## 🏢 Project Overview

The Dymin Quote Calculator is a Next.js 14 application designed for generating managed services quotes with HaloPSA integration. It features a modern, responsive UI with dark theme navigation and comprehensive quote management capabilities.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL (hosted on Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **External API**: HaloPSA OAuth2 integration

---

## 🎨 Design System

### Color Palette
- **Brand Blue**: `#15bef0` (primary accent, buttons, active states)
- **Dark Navigation**: `#343333` (sidebar, quote summary background)
- **Text Colors**: White on dark backgrounds, various grays on light
- **Active Tab Text**: `#0891b2` (darker blue for better contrast)

### UI Components
- **Navigation**: Dark sidebar with geometric icons (◈, +, ▤, ⚬)
- **Quote Summary**: Dark theme sticky sidebar matching navigation
- **Checkboxes**: Custom with brand blue fill when selected
- **Progress Indicators**: Brand blue progress bars with step completion

---

## 🏗️ Architecture

### Database Schema (Prisma)

#### Core Models
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model Account {
  // NextAuth account management
}

model Session {
  // NextAuth session management
}
```

#### HaloPSA Integration Models
```prisma
model HaloTeam {
  id           Int      @id
  name         String
  ticket_count Int      @default(0)
  agents       HaloAgent[]
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
}

model HaloAgent {
  id            Int      @id
  name          String
  email         String?
  level         Int      // 1=Junior, 2=Intermediate, 3=Senior
  cost_per_hour Decimal
  is_active     Boolean  @default(true)
  team_id       Int
  team          HaloTeam @relation(fields: [team_id], references: [id])
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
}

model HaloSyncLog {
  id              String   @id @default(cuid())
  sync_type       String   // 'teams', 'agents', 'service_hours'
  status          String   // 'success', 'error', 'partial'
  records_synced  Int      @default(0)
  error_message   String?
  sync_timestamp  DateTime @default(now())
}

model TeamCostAnalysis {
  id                    String   @id @default(cuid())
  team_id               Int
  team_name             String
  level_1_avg_cost      Decimal?
  level_1_agent_count   Int      @default(0)
  level_2_avg_cost      Decimal?
  level_2_agent_count   Int      @default(0)
  level_3_avg_cost      Decimal?
  level_3_agent_count   Int      @default(0)
  total_agents          Int      @default(0)
  analysis_date         DateTime @default(now())
}
```

#### Service Hours Models
```prisma
model HaloService {
  id          Int    @id
  name        String
  description String?
  is_active   Boolean @default(true)
  templates   HaloServiceTemplate[]
}

model HaloServiceTemplate {
  id              Int      @id
  halo_id         Int      @unique
  name            String
  description     String?
  level1_hours    Decimal  @default(0)
  level2_hours    Decimal  @default(0)
  level3_hours    Decimal  @default(0)
  total_hours     Decimal  @default(0)
  category        String   @default("General")
  template_type   String   @default("Standard")
  service_id      Int?
  service         HaloService? @relation(fields: [service_id], references: [id])
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}

model ServiceHoursSyncLog {
  id                     String   @id @default(cuid())
  templates_processed    Int      @default(0)
  templates_with_hours   Int      @default(0)
  templates_saved        Int      @default(0)
  sync_status           String   // 'success', 'error', 'partial'
  error_details         String?
  sync_timestamp        DateTime @default(now())
}
```

---

## 🔗 API Endpoints

### HaloPSA Integration (`/api/halopsa/`)

#### Authentication & Core
- **`POST /api/halopsa/token`** - Get OAuth2 access token
- **`GET /api/halopsa/test`** - Test HaloPSA connection

#### Data Fetching
- **`GET /api/halopsa/pax8-details`** - Fetch Pax8 integration configuration
- **`GET /api/halopsa/teams`** - Get all teams with agents
- **`GET /api/halopsa/agents`** - Get all agents

#### Sync Operations
- **`POST /api/halopsa/sync-teams`** - Sync teams and agents with cost analysis
- **`POST /api/halopsa/sync-service-hours`** - Sync service templates and hours

### Quote Management
- **`POST /api/quotes`** - Create new quote
- **`GET /api/quotes`** - List user quotes
- **`GET /api/quotes/[id]`** - Get specific quote
- **`PUT /api/quotes/[id]`** - Update quote
- **`DELETE /api/quotes/[id]`** - Delete quote

---

## 🔧 HaloPSA Integration

### OAuth2 Configuration
```typescript
// Environment Variables Required
HALOPSA_CLIENT_ID=your_client_id
HALOPSA_CLIENT_SECRET=your_client_secret
HALOPSA_BASE_URL=https://yourdomain.halopsa.com
```

### Authentication Flow
```typescript
// Token acquisition
const tokenResponse = await fetch(`${baseUrl}/auth/token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'all'
  })
})
```

### Key Integration Methods

#### Team & Agent Sync
```typescript
// Fetches teams with agents and calculates cost averages by skill level
async syncTeamAgentCosts(): Promise<SyncResult> {
  // 1. Fetch teams with includeagentsforteams=true
  // 2. Process agents by skill level (1, 2, 3)
  // 3. Calculate average costs per level per team
  // 4. Save to database with TeamCostAnalysis
  // 5. Return processed data and sync statistics
}
```

#### Service Hours Sync
```typescript
// Fetches service templates and extracts hour estimates
async syncServiceHours(): Promise<SyncResult> {
  // 1. Get all templates from /Template endpoint
  // 2. Extract hours from template.estimate field
  // 3. Distribute hours across skill levels based on complexity
  // 4. Save to HaloServiceTemplate model
  // 5. Create sync log entry
}
```

### Data Processing

#### Skill Level Distribution
- **Level 1 (Junior)**: 40% of total hours, $22/hr cost
- **Level 2 (Intermediate)**: 35% of total hours, $37/hr cost  
- **Level 3 (Senior)**: 25% of total hours, $46/hr cost

#### Cost Calculation Factors
- **Location**: Onsite vs Remote (affects complexity)
- **Timing**: Business hours vs After hours (affects rates)
- **Service Type**: Different base hour estimates per service

---

## 🖥️ User Interface

### Navigation Structure
```
📋 Dashboard (■)     - Main overview and stats
➕ New Quote (+)    - Quote wizard interface  
📊 View Quotes (▤)  - Quote history and management
⚙️ Settings (⚬)    - HaloPSA sync and configuration
```

### Quote Wizard Flow

#### Step 1: Customer Info & Setup Services
- **Customer Information**: Company details, contract terms, user counts
- **Infrastructure**: Workstations, servers, printers, phone extensions
- **Setup Services**: Configurable services with skill levels and factors
- **Real-time Calculations**: Updates as user inputs change

#### Step 2: Monthly Managed Services
- **Tools & Licensing**: Fixed and variable cost tools
- **Support Labor**: (Coming Soon)
- **Other Labor**: (Coming Soon)  
- **HaaS**: Hardware as a Service (Coming Soon)

### Responsive Design

#### Desktop Layout
- **Main Content**: Flexible width form content
- **Sticky Sidebar**: 320px quote summary (dark theme)
- **Navigation**: Fixed dark sidebar with brand logo

#### Mobile Layout  
- **Stacked Layout**: Form content above quote summary
- **Full Width**: Form takes full mobile width
- **Bottom Summary**: Quote summary flows at bottom (no sticky)

---

## 📊 Quote Calculation Engine

### Setup Services Calculation
```typescript
interface SetupService {
  id: string
  name: string
  isActive: boolean
  skillLevel: 1 | 2 | 3
  factor1: 'onsite' | 'remote'
  factor2: 'business' | 'afterhours'
  hours: number // Auto-calculated based on customer data
}

// Pricing matrix
const rates = {
  1: { business: 155, afterhours: 155 },
  2: { business: 185, afterhours: 275 },
  3: { business: 275, afterhours: 375 }
}
```

### Monthly Services Structure
```typescript
interface MonthlyServicesData {
  fixedCostTools: FixedCostTool[]     // Amortized across customers
  variableCostTools: VariableCostTool[] // Per-device/user/customer
}

interface FixedCostTool {
  id: string
  name: string
  isActive: boolean
  extendedPrice: number
}

interface VariableCostTool {
  id: string
  name: string
  isActive: boolean
  nodesUnitsSupported: number
  costPerNodeUnit?: number
  pricePerNodeUnit?: number
  extendedCost: number
  extendedPrice: number
  margin: number
}
```

### Quote Totals
```typescript
interface QuoteCalculation {
  customer: CustomerInfo
  totals: {
    setupCosts: number        // One-time implementation
    supportLabor: number      // Monthly support hours
    toolsSoftware: number     // Monthly tools & licensing
    haas: number             // Hardware as a Service
    warranty: number         // Warranty & support
    monthlyTotal: number     // Total monthly recurring
    contractTotal: number    // Total contract value
  }
}
```

---

## 🔄 Sync Operations & Data Flow

### Team/Agent Sync Process
1. **Fetch Teams**: GET /Team?includeagentsforteams=true
2. **Process Agents**: Categorize by skill level, calculate averages
3. **Database Upsert**: Save teams, agents, and cost analysis
4. **Return Results**: Processed data with statistics

### Service Hours Sync Process  
1. **Fetch Templates**: GET /Template (bulk endpoint)
2. **Extract Hours**: Parse estimate field for hour values
3. **Skill Distribution**: Apply 40/35/25% split across levels
4. **Database Save**: Upsert HaloServiceTemplate records
5. **Sync Logging**: Record operation results

### Future Template Enhancement
- **Individual Template Details**: Fetch specific template IDs for estimate field
- **Team Assignment**: Use template team data instead of manual selection
- **Category Mapping**: Auto-assign factors based on template categories

---

## 🎯 Current Status & Roadmap

### ✅ Completed Features
- [x] HaloPSA OAuth2 integration
- [x] Team and agent syncing with cost analysis
- [x] Dark theme navigation with brand colors
- [x] Responsive quote wizard with sticky summary
- [x] Custom checkbox styling with brand blue
- [x] Progress indicators and step navigation
- [x] Service templates sync framework (partial)

### 🚧 In Progress
- [ ] Service hours sync (waiting for specific template IDs)
- [ ] Quote calculator integration with database service hours

### 📋 Planned Features
- [ ] Support Labor configuration tab
- [ ] Other Labor services tab
- [ ] Hardware as a Service (HaaS) tab
- [ ] Quote history and management
- [ ] PDF quote generation
- [ ] Customer portal integration

### 🔧 Technical Debt
- [ ] Environment variable validation
- [ ] Error handling improvements
- [ ] API rate limiting
- [ ] Comprehensive test suite
- [ ] Performance optimization

---

## 🔐 Security & Best Practices

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# HaloPSA  
HALOPSA_CLIENT_ID=your_client_id
HALOPSA_CLIENT_SECRET=your_client_secret
HALOPSA_BASE_URL=https://yourdomain.halopsa.com
```

### Security Measures
- OAuth2 client credentials flow for HaloPSA
- NextAuth.js for user authentication
- Prisma for SQL injection prevention
- Environment variable validation
- No hardcoded secrets in codebase

---

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check DATABASE_URL format
postgresql://username:password@host:5432/database

# Run Prisma migrations
npx prisma migrate dev
npx prisma generate
```

#### HaloPSA Authentication
```bash
# Verify environment variables
echo $HALOPSA_CLIENT_ID
echo $HALOPSA_BASE_URL

# Test API connection
curl -X POST "https://yourdomain.halopsa.com/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_ID&client_secret=YOUR_SECRET&scope=all"
```

#### UI Issues
- **Checkbox styling**: Ensure brand blue hex codes are correct
- **Mobile layout**: Check responsive breakpoints at 1024px (lg:)
- **Sticky sidebar**: Verify z-index and positioning conflicts

---

## 📝 Development Notes

### Code Organization
```
src/
├── app/
│   ├── api/halopsa/          # HaloPSA integration endpoints
│   ├── dashboard/            # Main application pages
│   └── login/               # Authentication pages
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── QuoteWizard.tsx      # Main quote interface
│   ├── Sidebar.tsx          # Navigation component
│   └── PricingSummary.tsx   # Quote summary display
├── lib/
│   ├── halopsa.ts           # HaloPSA API client
│   ├── calculations.ts      # Quote calculation engine
│   └── setupServices.ts    # Service configuration
└── types/
    ├── quote.ts             # Quote-related type definitions
    └── monthlyServices.ts   # Monthly services types
```

### Key Files
- **`/src/lib/halopsa.ts`**: Complete HaloPSA integration client
- **`/src/components/QuoteWizard.tsx`**: Main quote creation interface  
- **`/prisma/schema.prisma`**: Database schema definitions
- **`/src/app/api/halopsa/`**: All HaloPSA-related API endpoints

### Development Workflow
1. **Database Changes**: Update Prisma schema, run migrations
2. **API Updates**: Modify HaloPSA client, test endpoints
3. **UI Changes**: Update components, maintain responsive design
4. **Testing**: Verify sync operations, quote calculations

---

## 🎨 Brand Guidelines

### Visual Identity
- **Primary Brand Color**: #15bef0 (bright blue)
- **Secondary Dark**: #343333 (navigation/chrome)
- **Text Hierarchy**: White on dark, gray variations on light
- **Interactive Elements**: Brand blue for active/selected states

### Icon System
- **Navigation**: Geometric symbols (◈ + ▤ ⚬)
- **Service Categories**: Consistent geometric shapes
- **No Emoji**: Clean, professional appearance throughout

### Layout Principles
- **Chrome Elements**: Dark theme (nav, summary)
- **Content Areas**: Light theme for readability
- **Responsive First**: Mobile-friendly with desktop enhancements
- **Consistent Spacing**: 8px grid system with Tailwind classes

---

*Last Updated: [Current Date]*
*Version: 1.0*
*Status: Active Development*