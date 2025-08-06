# Family Budget App - Implementation TODO

## 🚀 Project Bootstrap

### Initial Setup

- [x] Initialize Next.js 15 project with TypeScript
- [x] Set up Prisma with PostgreSQL
- [x] Configure Tailwind CSS 4
- [x] Set up ESLint and Prettier
- [x] Configure Next.js for standalone output
- [x] Create initial project structure

### Database Schema

- [x] Create Prisma schema with simplified tables
- [x] Set up database migrations
- [x] Create seed data script
- [x] Test database connections

### Authentication

- [x] Implement NextAuth.js configuration
- [x] Create family-based authentication
- [x] Build signup flow (creates family + user)
- [x] Build login flow
- [x] Add session management
- [x] Create auth middleware

## 🏗️ Core Features

### Phase 1: Single-Page Overview (Week 1)

#### Dashboard Layout

- [x] Create single-page dashboard
- [x] Build income section component
- [x] Build expense section component
- [x] Create summary cards (income, expenses, balance)
- [x] Add scenario selector

#### Data Entry

- [x] Create inline editing for salaries
- [x] Build inline editing for expenses
- [ ] Add modal for new user income
- [x] Add modal for new user expense
- [ ] Create category management

### Phase 2: Scenario Management (Week 2)

#### Multiple Scenarios

- [x] Create scenario switcher UI
- [x] Build scenario creation form
- [ ] Implement scenario cloning
- [x] Add scenario deletion
- [x] Create active scenario indicator

#### Data Management

- [ ] Build edit overview page
- [ ] Create shared expense calculator
- [x] Add percentage-based splitting
- [x] Implement notes functionality
- [ ] Build data validation

### Phase 3: Polish & Export (Week 3)

#### Visual Design

- [x] Implement color coding (green/red/blue)
- [ ] Add visual progress indicators
- [x] Create responsive mobile layout
- [ ] Build print-friendly CSS
- [x] Add loading states

#### Export Features

- [ ] Implement PDF export
- [ ] Create print layout
- [ ] Build data backup (JSON export)
- [ ] Add scenario comparison view
- [ ] Create summary email template

### Phase 4: Final Features (Week 4)

#### User Experience

- [ ] Add help tooltips
- [ ] Create onboarding flow
- [ ] Build settings page
- [x] Add user profile management
- [ ] Implement keyboard shortcuts

#### Performance

- [ ] Optimize page load time
- [ ] Add client-side caching
- [ ] Implement optimistic updates
- [ ] Create error boundaries
- [ ] Add offline support

## 🔧 Technical Tasks

### Testing

- [ ] Set up Jest configuration
- [ ] Write unit tests for calculations
- [ ] Create component tests
- [ ] Add integration tests
- [ ] Test auth flows

### Security

- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Set up CORS properly
- [ ] Configure CSP headers
- [ ] Secure API routes

### Deployment

- [ ] Configure Fly.io deployment
- [ ] Set up environment variables
- [ ] Create production database
- [ ] Configure SSL
- [ ] Set up monitoring

## 🎯 Current Focus

**Currently working on:**

1. ✅ Initialize Next.js project
2. ✅ Set up Prisma and database
3. ✅ Update schema for single-page approach
4. ✅ Create simplified dashboard
5. ✅ Fix database connection and Prisma client issues
6. ✅ Implement authentication
   - ✅ Create login/signup pages
   - ✅ Set up NextAuth.js
   - ✅ Add session management
7. ✅ Build core dashboard components
   - ✅ Income section with inline editing
   - ✅ Expense section with inline editing
   - ✅ Summary cards
8. ✅ Implement scenario management
   - ✅ Overview manager component
   - ✅ Create/switch/delete scenarios
   - ✅ Active scenario indicator
9. ✅ Add salary frequency support
   - ✅ Support weekly, biweekly, semimonthly, monthly, yearly
   - ✅ Auto-calculate monthly amounts
   - ✅ Update UI for frequency selection
10. ✅ Add navigation and logout

- ✅ Create navbar component
- ✅ Add logout functionality
- ✅ Fix auth redirect URLs

11. ✅ Profile & Family Management

- ✅ Create profile page with user editing
- ✅ Add family member invitation system
- ✅ Support unverified users
- ✅ Allow income assignment to pending users
- ✅ Show verification status in UI

12. 🔄 Next focus: Visual polish and export features

## 🎨 UI Migration to Aceternity UI

### Overview
Migrating the Family Budget App from custom design system to Aceternity UI components for enhanced animations and modern UI patterns.

### Prerequisites
- [ ] Install Aceternity UI dependencies (framer-motion)
- [ ] Set up Aceternity UI utilities and configuration

### Component Migration
- [ ] Migrate Card components (Income/Expense/Summary) to Aceternity Card Spotlight
- [ ] Replace custom buttons with Aceternity Stateful Button
- [ ] Implement Aceternity Floating Navbar to replace current navbar
- [ ] Add Aceternity Animated Tabs for budget scenario switching
- [ ] Replace loading skeletons with Aceternity Multi Step Loader
- [ ] Implement Aceternity Animated Tooltip for help text
- [ ] Add Aceternity Timeline for expense history view
- [ ] Update color scheme to work with Aceternity dark/light mode

### Testing & Documentation
- [ ] Test all migrated components for functionality
- [ ] Update documentation with new component usage

## 📝 Key Principles

- **Single page focus** - Everything visible at once
- **No transaction tracking** - Only monthly summaries
- **Simple data entry** - Inline editing where possible
- **Clear visualization** - Color coding and simple charts
- **Fast performance** - Page loads under 1 second
- **Mobile friendly** - Responsive design

## 🚫 Not Implementing

- Individual expense tracking
- Daily transaction logs
- Receipt management
- Complex budgeting features
- AI-powered categorization
- Historical trending
- Multiple currencies
- Bank integrations

## 🤖 AI Budget Analysis Feature

### Feature Overview
Add intelligent budget analysis capabilities that allow users to:
- Compare their budget scenarios against AI-suggested benchmarks
- Get personalized financial insights based on their income and expenses
- Receive recommendations for budget optimization
- Compare their budget with typical situations (e.g., "family of 4 in urban area", "single professional", "retired couple")

### Implementation Guide

#### 1. AI Provider Abstraction Layer
Create a generic AI provider interface to support multiple AI services:

```typescript
// lib/ai/types.ts
interface AIProvider {
  analyze(budget: BudgetData, context: string): Promise<AnalysisResult>
  compareWithBenchmark(budget: BudgetData, benchmark: string): Promise<ComparisonResult>
  getSuggestions(budget: BudgetData): Promise<Suggestion[]>
}

interface AnalysisResult {
  summary: string
  insights: Insight[]
  healthScore: number
  recommendations: string[]
}
```

**Supported Providers:**
- OpenAI (GPT-4)
- Anthropic (Claude)
- Google AI (Gemini)
- Ollama (local models)
- Custom HTTP endpoints

#### 2. Database Schema Updates

```prisma
// Add to prisma/schema.prisma

model AIAnalysis {
  id              String   @id @default(cuid())
  overviewId      String
  overview        MonthlyOverview @relation(fields: [overviewId], references: [id])
  provider        String   // openai, anthropic, google, ollama, custom
  analysisType    String   // comparison, suggestions, benchmark
  context         String?  // User-provided context
  result          Json     // Analysis results
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model FamilySettings {
  id              String   @id @default(cuid())
  familyId        String   @unique
  family          Family   @relation(fields: [familyId], references: [id])
  aiProvider      String?  // Selected AI provider
  aiApiKey        String?  // Encrypted API key
  aiModel         String?  // Specific model to use
  aiEndpoint      String?  // Custom endpoint URL
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### 3. Component Structure

```
components/
├── ai/
│   ├── AIAnalysisPanel.tsx       // Main analysis display
│   ├── AIProviderSettings.tsx    // Provider configuration
│   ├── BudgetComparison.tsx      // Compare with benchmarks
│   ├── InsightCards.tsx          // Display AI insights
│   └── SuggestionsList.tsx       // Improvement suggestions
```

#### 4. API Implementation

```typescript
// app/api/ai/analyze/route.ts
export async function POST(request: Request) {
  const { overviewId, context } = await request.json()
  
  // Get user's AI settings
  const settings = await getFamilyAISettings()
  
  // Initialize provider based on settings
  const provider = createAIProvider(settings)
  
  // Fetch budget data
  const budgetData = await getBudgetData(overviewId)
  
  // Perform analysis
  const analysis = await provider.analyze(budgetData, context)
  
  // Store results
  await storeAnalysis(overviewId, analysis)
  
  return Response.json(analysis)
}
```

#### 5. UI Integration

**Dashboard Enhancement:**
- Add "AI Analysis" button to each budget scenario card
- Display analysis summary inline with expandable details
- Show health score indicator (visual gauge)
- Quick actions based on AI suggestions

**Settings Page:**
- AI provider selection dropdown
- API key input (encrypted storage)
- Model selection based on provider
- Test connection button
- Usage tracking and limits display

#### 6. Security Considerations

- **API Key Storage:** Encrypt keys using AES-256 before database storage
- **Rate Limiting:** Implement per-family rate limits
- **Data Privacy:** Allow users to opt-out of AI analysis
- **Sanitization:** Clean sensitive data before sending to AI providers
- **Audit Logging:** Track all AI analysis requests

#### 7. User Flows

**Initial Setup:**
1. User navigates to Settings > AI Analysis
2. Selects preferred AI provider
3. Enters API key (with validation)
4. Tests connection
5. Saves settings

**Analysis Flow:**
1. User selects budget scenario
2. Clicks "Analyze with AI"
3. Optionally provides context (e.g., "family of 4 in Seattle")
4. System fetches and formats budget data
5. Sends to AI provider
6. Displays results with actionable insights

#### 8. Implementation Phases

**Phase 1: Foundation (Week 1)**
- [ ] Create AI provider abstraction
- [ ] Update database schema
- [ ] Implement settings storage
- [ ] Build provider factory

**Phase 2: Core Providers (Week 2)**
- [ ] Implement OpenAI provider
- [ ] Implement Anthropic provider
- [ ] Add local Ollama support
- [ ] Create provider tests

**Phase 3: UI Components (Week 3)**
- [ ] Build settings interface
- [ ] Create analysis panel
- [ ] Add comparison views
- [ ] Implement insight cards

**Phase 4: Integration (Week 4)**
- [ ] Integrate with dashboard
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add usage tracking

**Phase 5: Enhancement (Week 5)**
- [ ] Add benchmark library
- [ ] Implement caching
- [ ] Create export functionality
- [ ] Add historical analysis

#### 9. Configuration Examples

**OpenAI Configuration:**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
```

**Ollama Configuration:**
```env
AI_PROVIDER=ollama
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=llama2
```

**Custom Endpoint:**
```env
AI_PROVIDER=custom
CUSTOM_AI_ENDPOINT=https://api.mycompany.com/ai
CUSTOM_AI_KEY=custom-key
```

#### 10. Prompt Templates

```typescript
// lib/ai/prompts.ts
export const ANALYSIS_PROMPT = `
Analyze this family budget:
- Monthly Income: {totalIncome}
- Monthly Expenses: {totalExpenses}
- Categories: {expenseBreakdown}
- Family Size: {familySize}
- Context: {userContext}

Provide:
1. Overall financial health assessment
2. Top 3 insights
3. Specific recommendations
4. Comparison to typical {userContext} budget
`
```

#### 11. Cost Estimation

**API Costs (per analysis):**
- OpenAI GPT-4: ~$0.03-0.05
- Anthropic Claude: ~$0.02-0.04
- Google Gemini: ~$0.01-0.03
- Ollama: Free (local)

**Monthly estimates:**
- Light usage (10 analyses): $0.30-0.50
- Medium usage (50 analyses): $1.50-2.50
- Heavy usage (200 analyses): $6.00-10.00

#### 12. Testing Strategy

- **Unit Tests:** Provider implementations, prompt generation
- **Integration Tests:** API endpoints, database operations
- **E2E Tests:** Complete analysis flow
- **Load Tests:** Provider rate limits, caching

#### 13. Monitoring & Analytics

- Track analysis requests per family
- Monitor provider response times
- Log error rates by provider
- Track most requested comparison contexts
- Measure user engagement with suggestions

### Technical Requirements

- Node.js crypto for encryption
- Zod for API validation
- React Query for caching
- Recharts for visualizations
- React Hook Form for settings

### Success Metrics

- User adoption rate of AI features
- Average health score improvements
- Suggestion implementation rate
- User satisfaction scores
- Cost per analysis optimization

### Future Enhancements

1. **Predictive Analysis:** Forecast future financial scenarios
2. **Goal Setting:** AI-assisted financial goal planning
3. **Peer Comparison:** Anonymous comparison with similar families
4. **Voice Integration:** Natural language budget queries
5. **Automated Alerts:** Proactive budget health notifications
6. **Export Reports:** AI-generated financial reports
7. **Multi-language Support:** Analysis in user's preferred language

### Notes

- Start with OpenAI as the default provider (most mature API)
- Implement Ollama early for privacy-conscious users
- Consider offering a free tier with limited analyses
- Build provider-agnostic to avoid vendor lock-in
- Focus on actionable insights over generic advice

---

Last updated: 2025-08-06
