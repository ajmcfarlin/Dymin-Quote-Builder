import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

interface HaloTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface HaloApiConfig {
  baseUrl: string
  clientId: string
  clientSecret: string
  tenantId?: string
}

class HaloPSAClient {
  private config: HaloApiConfig
  private token: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.config = {
      baseUrl: process.env.HALOPSA_BASE_URL!,
      clientId: process.env.HALOPSA_CLIENT_ID!,
      clientSecret: process.env.HALOPSA_CLIENT_SECRET!,
      tenantId: process.env.HALOPSA_TENANT_ID
    }

    if (!this.config.baseUrl || !this.config.clientId || !this.config.clientSecret) {
      throw new Error('Missing required HaloPSA environment variables')
    }
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token
    }

    try {
      const tokenUrl = `${this.config.baseUrl}/auth/token`
      
      const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        scope: 'all'
      })

      // Add tenant_id if it's a hosted solution
      if (this.config.tenantId) {
        body.append('tenant_id', this.config.tenantId)
      }

      console.log('Requesting HaloPSA token from:', tokenUrl)

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString()
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Token request failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const tokenData: HaloTokenResponse = await response.json()
      
      this.token = tokenData.access_token
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000 // Refresh 1 minute before expiry
      
      console.log('Successfully obtained HaloPSA token, expires in:', tokenData.expires_in, 'seconds')
      
      return this.token
    } catch (error) {
      console.error('Failed to get HaloPSA access token:', error)
      throw error
    }
  }

  async makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken()
    
    const url = `${this.config.baseUrl}/api${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      // Try to get basic info - this endpoint should be available
      await this.makeApiRequest('/Status')
      console.log('HaloPSA connection test successful!')
      return true
    } catch (error) {
      console.error('HaloPSA connection test failed:', error)
      return false
    }
  }

  // Get clients/customers
  async getClients(count: number = 10): Promise<any[]> {
    try {
      const response = await this.makeApiRequest(`/Client?count=${count}`)
      return response.clients || []
    } catch (error) {
      console.error('Failed to get clients:', error)
      throw error
    }
  }

  // Get tickets with various options
  async getTickets(options: {
    count?: number
    pageSize?: number
    pageNo?: number
    includeDetails?: boolean
    includeChildIds?: boolean
    clientId?: number
    statusId?: number
    openOnly?: boolean
    search?: string
  } = {}): Promise<any> {
    try {
      const params = new URLSearchParams()
      
      if (options.count) params.append('page_size', options.count.toString())
      if (options.pageSize) params.append('page_size', options.pageSize.toString())
      if (options.pageNo) params.append('page_no', options.pageNo.toString())
      if (options.includeDetails) params.append('includedetails', 'true')
      if (options.includeChildIds) params.append('includechildids', 'true')
      if (options.clientId) params.append('client_id', options.clientId.toString())
      if (options.statusId) params.append('status_id', options.statusId.toString())
      if (options.openOnly) params.append('open_only', 'true')
      if (options.search) params.append('search', options.search)

      const queryString = params.toString()
      const endpoint = queryString ? `/Tickets?${queryString}` : '/Tickets'
      
      console.log('Fetching tickets with endpoint:', endpoint)
      
      const response = await this.makeApiRequest(endpoint)
      return response
    } catch (error) {
      console.error('Failed to get tickets:', error)
      throw error
    }
  }

  // Get a specific ticket by ID with details
  async getTicket(ticketId: number, options: {
    includeDetails?: boolean
    includeLastAction?: boolean
  } = {}): Promise<any> {
    try {
      const params = new URLSearchParams()
      
      if (options.includeDetails) params.append('includedetails', 'true')
      if (options.includeLastAction) params.append('includelastaction', 'true')

      const queryString = params.toString()
      const endpoint = queryString ? `/Tickets/${ticketId}?${queryString}` : `/Tickets/${ticketId}`
      
      console.log('Fetching ticket details with endpoint:', endpoint)
      
      const response = await this.makeApiRequest(endpoint)
      return response
    } catch (error) {
      console.error(`Failed to get ticket ${ticketId}:`, error)
      throw error
    }
  }

  // Get request types (ticket templates)
  async getRequestTypes(): Promise<any> {
    try {
      const response = await this.makeApiRequest('/RequestType')
      return response
    } catch (error) {
      console.error('Failed to get request types:', error)
      throw error
    }
  }

  // Get ticket types
  async getTicketTypes(options: {
    showcounts?: boolean
    showinactive?: boolean
    includedetails?: boolean
  } = {}): Promise<any> {
    try {
      const params = new URLSearchParams()
      if (options.showcounts) params.append('showcounts', 'true')
      if (options.showinactive) params.append('showinactive', 'true')
      
      const queryString = params.toString()
      const endpoint = queryString ? `/TicketType?${queryString}` : '/TicketType'
      
      const response = await this.makeApiRequest(endpoint)
      return response
    } catch (error) {
      console.error('Failed to get ticket types:', error)
      throw error
    }
  }

  // Get specific ticket type by ID with details
  async getTicketType(id: number, includeDetails: boolean = true): Promise<any> {
    try {
      const params = new URLSearchParams()
      if (includeDetails) params.append('includedetails', 'true')
      
      const queryString = params.toString()
      const endpoint = queryString ? `/TicketType/${id}?${queryString}` : `/TicketType/${id}`
      
      const response = await this.makeApiRequest(endpoint)
      return response
    } catch (error) {
      console.error(`Failed to get ticket type ${id}:`, error)
      throw error
    }
  }

  // Get workflows/processes
  async getWorkflows(): Promise<any> {
    try {
      const response = await this.makeApiRequest('/Workflow')
      return response
    } catch (error) {
      console.error('Failed to get workflows:', error)
      throw error
    }
  }

  // Get SLA templates (might contain time estimates)
  async getSLAs(): Promise<any> {
    try {
      const response = await this.makeApiRequest('/SLA')
      return response
    } catch (error) {
      console.error('Failed to get SLAs:', error)
      throw error
    }
  }

  // Get items (service catalog items)
  async getItems(count: number = 20): Promise<any> {
    try {
      const response = await this.makeApiRequest(`/Item?count=${count}`)
      return response
    } catch (error) {
      console.error('Failed to get items:', error)
      throw error
    }
  }

  // Get categories (might help with valid category values)
  async getCategories(): Promise<any> {
    try {
      const response = await this.makeApiRequest('/Category')
      return response
    } catch (error) {
      console.error('Failed to get categories:', error)
      throw error
    }
  }

  // BREAKTHROUGH: Get all templates directly!
  async getTemplates(): Promise<any> {
    try {
      const response = await this.makeApiRequest('/Template')
      return response
    } catch (error) {
      console.error('Failed to get templates:', error)
      throw error
    }
  }

  // Get specific template by ID with detailed values including child templates
  async getTemplate(templateId: number): Promise<any> {
    try {
      const response = await this.makeApiRequest(`/Template/${templateId}`)
      return response
    } catch (error) {
      console.error(`Failed to get template ${templateId}:`, error)
      throw error
    }
  }

  // Test getting template 46 specifically (the one from the URL)
  async getTemplate46Details(): Promise<any> {
    try {
      console.log('Getting detailed template 46 data...')
      const response = await this.getTemplate(46)
      return response
    } catch (error) {
      console.error('Failed to get template 46 details:', error)
      throw error
    }
  }

  // Get users/agents
  async getUsers(count: number = 10): Promise<any> {
    try {
      const response = await this.makeApiRequest(`/Users?count=${count}`)
      return response
    } catch (error) {
      console.error('Failed to get users:', error)
      throw error
    }
  }

  // Get actual agents/employees (not client users)
  async getAgents(count: number = 20): Promise<any> {
    try {
      const response = await this.makeApiRequest(`/Agent?count=${count}`)
      return response
    } catch (error) {
      console.error('Failed to get agents:', error)
      throw error
    }
  }

  // Create a new ticket (potentially with template)
  async createTicket(ticketData: any): Promise<any> {
    try {
      // HaloPSA expects an array format for ticket creation
      const ticketArray = Array.isArray(ticketData) ? ticketData : [ticketData]
      
      const response = await this.makeApiRequest('/Tickets', {
        method: 'POST',
        body: JSON.stringify(ticketArray)
      })
      return response
    } catch (error) {
      console.error('Failed to create ticket:', error)
      throw error
    }
  }

  // Test creating a ticket with a template ID to discover template system
  async testTemplateCreation(templateId: number, testData: any = {}): Promise<any> {
    try {
      // Get a valid client ID and category
      const clients = await this.getClients(1)
      const clientId = clients.length > 0 ? clients[0].id : 1
      
      const existingTickets = await this.getTickets({ count: 5, includeDetails: true })
      let validCategory1 = 'Incident'
      if (existingTickets.tickets && existingTickets.tickets.length > 0) {
        for (const ticket of existingTickets.tickets) {
          if (ticket.category_1 && ticket.category_1.trim() !== '') {
            validCategory1 = ticket.category_1
            break
          }
        }
      }
      
      const ticketData = {
        summary: 'Template Discovery Test Ticket',
        details: 'Testing template system discovery',
        client_id: clientId,
        template_id: templateId,
        // Required fields
        category_1: validCategory1,
        impact: 3,
        urgency: 3,
        priority_id: 4, // Normal priority
        ...testData
      }
      
      console.log('Testing ticket creation with template_id:', templateId, 'and client_id:', clientId)
      const response = await this.createTicket(ticketData)
      return response
    } catch (error) {
      console.error(`Failed to test template creation with ID ${templateId}:`, error)
      throw error
    }
  }

  // Test creating a ticket with specific template ID 46 (from URL)
  async testTemplate46Creation(): Promise<any> {
    try {
      // Get a valid client ID and category
      const clients = await this.getClients(1)
      const clientId = clients.length > 0 ? clients[0].id : 1
      
      const existingTickets = await this.getTickets({ count: 5, includeDetails: true })
      let validCategory1 = 'Incident'
      if (existingTickets.tickets && existingTickets.tickets.length > 0) {
        for (const ticket of existingTickets.tickets) {
          if (ticket.category_1 && ticket.category_1.trim() !== '') {
            validCategory1 = ticket.category_1
            break
          }
        }
      }
      
      const ticketData = {
        summary: 'Template 46 Test - From HaloPSA URL',
        details: 'Testing template ID 46 from https://ajmcfarlin13950129.halopsa.com/config/tickets/templates?type=6&id=46',
        client_id: clientId,
        template_id: 46,
        child_template_id: 46,
        // Required fields
        category_1: validCategory1,
        impact: 3,
        urgency: 3,
        priority_id: 4
      }
      
      console.log('Testing template 46 creation with client_id:', clientId, 'category_1:', validCategory1)
      const response = await this.createTicket(ticketData)
      return response
    } catch (error) {
      console.error('Failed to test template 46 creation:', error)
      throw error
    }
  }

  // Test creating a ticket with ONLY child_template_id (no template_id)
  async testChildTemplate46Only(): Promise<any> {
    try {
      // Get a valid client ID and category
      const clients = await this.getClients(1)
      const clientId = clients.length > 0 ? clients[0].id : 1
      
      const existingTickets = await this.getTickets({ count: 5, includeDetails: true })
      let validCategory1 = 'Incident'
      if (existingTickets.tickets && existingTickets.tickets.length > 0) {
        for (const ticket of existingTickets.tickets) {
          if (ticket.category_1 && ticket.category_1.trim() !== '') {
            validCategory1 = ticket.category_1
            break
          }
        }
      }
      
      const ticketData = {
        summary: 'Child Template 46 ONLY Test',
        details: 'Testing ONLY child_template_id: 46 (no template_id set)',
        client_id: clientId,
        // ONLY set child_template_id, not template_id
        child_template_id: 46,
        // Required fields
        category_1: validCategory1,
        impact: 3,
        urgency: 3,
        priority_id: 4
      }
      
      console.log('Testing child template 46 ONLY with client_id:', clientId, 'category_1:', validCategory1)
      const response = await this.createTicket(ticketData)
      return response
    } catch (error) {
      console.error('Failed to test child template 46 only:', error)
      throw error
    }
  }

  // Test creating a quote without a ticket (direct quote creation)
  async testDirectQuoteCreation(): Promise<any> {
    try {
      // Get valid client and user data
      const [clients, users] = await Promise.all([
        this.getClients(1),
        this.getUsers(1)
      ])
      
      const clientId = clients.length > 0 ? clients[0].id : 1
      const clientData = clients.length > 0 ? clients[0] : null
      
      // Get a valid user from the Users endpoint
      const validUser = users.users && users.users.length > 0 ? users.users[0] : null
      
      if (!validUser) {
        throw new Error('No valid users found for quote creation')
      }
      
      console.log('Found valid user for quote:', {
        id: validUser.id,
        name: validUser.name,
        firstname: validUser.firstname,
        surname: validUser.surname
      })
      
      const quoteData = {
        title: 'Direct Quote Test - No Ticket Required',
        client_id: clientId,
        // Try without ticket_id to see if it's required
        status: 0, // Draft status (try 0 instead of 1)
        user_id: validUser.id,
        site_id: clientData?.main_site_id || null,
        date: new Date().toISOString().split('T')[0], // Today's date
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        lines: [
          {
            description: 'Test Service Item - Setup Hours',
            quantity: 2,
            unitprice: 150.00,
            linetotal: 300.00,
            item_id: null // Might need actual item IDs from HaloPSA
          },
          {
            description: 'Monthly Service - Monitoring',
            quantity: 1,
            unitprice: 99.00,
            linetotal: 99.00,
            item_id: null
          }
        ],
        // Let HaloPSA calculate these or set them explicitly
        revenue: 399.00,
        total: 399.00
      }
      
      console.log('Testing direct quote creation without ticket_id:', quoteData)
      const response = await this.createQuote(quoteData)
      return response
    } catch (error) {
      console.error('Failed to test direct quote creation:', error)
      throw error
    }
  }

  // Get Pax8 details (Microsoft products)
  async getPax8Details(): Promise<any> {
    try {
      console.log('Fetching Pax8 details (Microsoft products)...')
      const response = await this.makeApiRequest('/Pax8Details')
      return response
    } catch (error) {
      console.error('Failed to get Pax8 details:', error)
      throw error
    }
  }

  // Get all teams with their agents for cost analysis
  async getTeamsWithAgents(options: {
    includeAllTeams?: boolean
    specificTeams?: string[]
    includeTicketCounts?: boolean
  } = {}): Promise<any> {
    try {
      const params = new URLSearchParams()
      
      // Include agents for all teams or specific teams
      if (options.specificTeams && options.specificTeams.length > 0) {
        params.append('includeagentsforteams', options.specificTeams.join(','))
      } else if (options.includeAllTeams) {
        // We'll need to get team names first, then include agents
        params.append('showall', 'true')
      }
      
      if (options.includeTicketCounts) {
        params.append('showcounts', 'true')
        params.append('domain', 'reqs') // tickets domain
      }
      
      // Include both enabled and disabled teams for complete data
      params.append('includeenabled', 'true')
      params.append('includedisabled', 'true')

      const queryString = params.toString()
      const endpoint = queryString ? `/Team?${queryString}` : '/Team'
      
      console.log('Fetching teams with agents using endpoint:', endpoint)
      const response = await this.makeApiRequest(endpoint)
      return response
    } catch (error) {
      console.error('Failed to get teams with agents:', error)
      throw error
    }
  }

  // Comprehensive team and agent cost sync
  async syncTeamAgentCosts(): Promise<any> {
    try {
      console.log('Starting comprehensive team and agent cost sync...')
      
      // Step 1: Get all teams to find team names
      const allTeams = await this.makeApiRequest('/Team?showall=true&includeenabled=true&includedisabled=true')
      console.log('Found teams - full response:', JSON.stringify(allTeams, null, 2))
      
      // Check different possible response structures
      const teamsArray = allTeams.root || allTeams.teams || allTeams || []
      console.log('Teams array found:', teamsArray)
      console.log('Teams array length:', teamsArray.length)
      
      // Extract team names for the agents request
      const teamNames = teamsArray.map((team: any) => team.name).filter((name: string) => name && name.trim().length > 0) || []
      console.log('Team names for agent inclusion:', teamNames)
      console.log('Raw team data for debugging:', teamsArray.map((team: any) => ({ id: team.id, name: team.name, inactive: team.inactive })))
      
      // Step 2: Get teams with all their agents included
      console.log('Getting teams with agents for team names:', teamNames)
      const teamsWithAgents = await this.getTeamsWithAgents({
        specificTeams: teamNames,
        includeTicketCounts: true
      })
      console.log('Teams with agents response:', JSON.stringify(teamsWithAgents, null, 2))
      
      // Check if any teams actually have agents
      if (teamsWithAgents?.root) {
        teamsWithAgents.root.forEach((team: any, index: number) => {
          console.log(`Team ${index}: ${team.name} has ${team.agents?.length || 0} agents`)
          if (team.agents && team.agents.length > 0) {
            console.log(`Sample agent data for ${team.name}:`, team.agents[0])
          }
        })
      }
      
      // Step 3: Check if we got any agents from teams, if not try direct agent fetch
      const hasAnyAgents = teamsWithAgents?.root?.some((team: any) => team.agents && team.agents.length > 0)
      console.log('Teams have agents:', hasAnyAgents)
      
      let processedData
      let directAgents = null
      
      if (!hasAnyAgents) {
        console.log('No agents found in teams, trying direct agent fetch...')
        directAgents = await this.getAgents(100) // Get more agents
        console.log('Direct agents response:', directAgents)
        processedData = this.processDirectAgents(directAgents)
      } else {
        processedData = this.processTeamAgentCosts(teamsWithAgents)
      }
      
      // Step 4: Save processed data to database
      console.log('Saving synced data to database...')
      const savedData = await this.saveTeamAgentDataToDatabase(processedData, !hasAnyAgents)
      
      return {
        raw_teams: allTeams,
        teams_with_agents: teamsWithAgents,
        direct_agents: directAgents,
        processed_analysis: processedData,
        database_result: savedData,
        sync_timestamp: new Date().toISOString(),
        fallback_used: !hasAnyAgents
      }
    } catch (error) {
      console.error('Failed to sync team agent costs:', error)
      throw error
    }
  }

  // Process team and agent data to calculate cost averages by level
  private processTeamAgentCosts(teamsData: any): any {
    try {
      const analysis = {
        teams: [] as any[],
        global_averages: {
          level_1: { agents: [] as any[], average_cost: 0 },
          level_2: { agents: [] as any[], average_cost: 0 },
          level_3: { agents: [] as any[], average_cost: 0 }
        },
        total_agents: 0,
        teams_processed: 0
      }

      if (!teamsData?.root) {
        return analysis
      }

      teamsData.root.forEach((team: any) => {
        const teamAnalysis = {
          id: team.id,
          name: team.name,
          ticket_count: team.ticket_count || 0,
          agents: [] as any[],
          level_costs: {
            level_1: { agents: [] as any[], average_cost: 0, count: 0 },
            level_2: { agents: [] as any[], average_cost: 0, count: 0 },
            level_3: { agents: [] as any[], average_cost: 0, count: 0 }
          }
        }

        // Process agents in this team
        if (team.agents && Array.isArray(team.agents)) {
          team.agents.forEach((agent: any) => {
            // Determine agent level based on various fields
            const agentLevel = this.determineAgentLevel(agent)
            const agentCost = this.extractAgentCost(agent)
            
            const processedAgent = {
              id: agent.id,
              name: agent.name || `${agent.firstname} ${agent.surname}`.trim(),
              email: agent.emailaddress,
              level: agentLevel,
              cost_per_hour: agentCost,
              is_active: agent.inactive !== true,
              department_id: agent.department_id,
              team_name: team.name,
              raw_data: agent
            }

            teamAnalysis.agents.push(processedAgent)
            analysis.total_agents++

            // Add to level-specific analysis
            if (agentLevel >= 1 && agentLevel <= 3) {
              const levelKey = `level_${agentLevel}` as keyof typeof teamAnalysis.level_costs
              teamAnalysis.level_costs[levelKey].agents.push(processedAgent)
              teamAnalysis.level_costs[levelKey].count++
              
              // Add to global averages
              analysis.global_averages[levelKey].agents.push(processedAgent)
            }
          })

          // Calculate team-level averages
          Object.keys(teamAnalysis.level_costs).forEach(levelKey => {
            const level = teamAnalysis.level_costs[levelKey as keyof typeof teamAnalysis.level_costs]
            if (level.agents.length > 0) {
              const costs = level.agents.map(a => a.cost_per_hour).filter(c => c > 0)
              level.average_cost = costs.length > 0 ? 
                costs.reduce((sum, cost) => sum + cost, 0) / costs.length : 0
            }
          })
        }

        analysis.teams.push(teamAnalysis)
        analysis.teams_processed++
      })

      // Calculate global averages
      Object.keys(analysis.global_averages).forEach(levelKey => {
        const level = analysis.global_averages[levelKey as keyof typeof analysis.global_averages]
        if (level.agents.length > 0) {
          const costs = level.agents.map(a => a.cost_per_hour).filter(c => c > 0)
          level.average_cost = costs.length > 0 ? 
            costs.reduce((sum, cost) => sum + cost, 0) / costs.length : 0
        }
      })

      return analysis
    } catch (error) {
      console.error('Error processing team agent costs:', error)
      return { error: error instanceof Error ? error.message : 'Processing error' }
    }
  }

  // Determine agent skill level from their data
  private determineAgentLevel(agent: any): number {
    // Look for level indicators in agent data
    if (agent.level) return parseInt(agent.level) || 2
    if (agent.skill_level) return parseInt(agent.skill_level) || 2
    if (agent.grade) return parseInt(agent.grade) || 2
    
    // Fallback logic based on title/role (use jobtitle from HaloPSA)
    const title = (agent.title || agent.job_title || agent.jobtitle || '').toLowerCase()
    
    // Senior level indicators
    if (title.includes('senior') || title.includes('lead') || title.includes('principal') || 
        title.includes('manager') || title.includes('director')) return 3
    
    // Junior level indicators  
    if (title.includes('junior') || title.includes('trainee') || title.includes('intern') ||
        title.includes('apprentice') || title.includes('assistant')) return 1
    
    // Intermediate level (engineers, consultants, specialists)
    if (title.includes('engineer') || title.includes('consultant') || title.includes('specialist')) return 2
    
    // Default to level 2 (intermediate)
    return 2
  }

  // Extract cost per hour from agent data
  private extractAgentCost(agent: any): number {
    // Look for cost fields in agent data (HaloPSA uses costprice!)
    if (agent.costprice && agent.costprice > 0) return parseFloat(agent.costprice) || 0
    if (agent.hourly_rate) return parseFloat(agent.hourly_rate) || 0
    if (agent.cost_per_hour) return parseFloat(agent.cost_per_hour) || 0
    if (agent.rate) return parseFloat(agent.rate) || 0
    if (agent.labor_rate) return parseFloat(agent.labor_rate) || 0
    if (agent.chargerate && agent.chargerate > 0) return parseFloat(agent.chargerate) || 0
    
    // Default cost based on assumed level (fallback)
    const level = this.determineAgentLevel(agent)
    const defaultRates = { 1: 22, 2: 37, 3: 46 } // Based on your existing cost structure
    return defaultRates[level as keyof typeof defaultRates] || 37
  }

  // Process agents directly when teams don't work
  private processDirectAgents(agentsData: any): any {
    try {
      const analysis = {
        teams: [] as any[],
        global_averages: {
          level_1: { agents: [] as any[], average_cost: 0 },
          level_2: { agents: [] as any[], average_cost: 0 },
          level_3: { agents: [] as any[], average_cost: 0 }
        },
        total_agents: 0,
        teams_processed: 0
      }

      if (!agentsData?.agents && !Array.isArray(agentsData)) {
        console.log('No agents data found in response:', agentsData)
        return analysis
      }

      const agents = agentsData.agents || agentsData || []
      console.log('Processing', agents.length, 'agents directly')

      agents.forEach((agent: any) => {
        const agentLevel = this.determineAgentLevel(agent)
        const agentCost = this.extractAgentCost(agent)

        const processedAgent = {
          id: agent.id,
          name: agent.name || `${agent.firstname} ${agent.surname}`.trim(),
          email: agent.emailaddress,
          level: agentLevel,
          cost_per_hour: agentCost,
          is_active: agent.inactive !== true,
          department_id: agent.department_id,
          team_name: 'Unknown Team',
          raw_data: agent
        }

        analysis.total_agents++

        // Add to global averages
        if (agentLevel >= 1 && agentLevel <= 3) {
          const levelKey = `level_${agentLevel}` as keyof typeof analysis.global_averages
          analysis.global_averages[levelKey].agents.push(processedAgent)
        }
      })

      // Calculate global averages
      Object.keys(analysis.global_averages).forEach(levelKey => {
        const level = analysis.global_averages[levelKey as keyof typeof analysis.global_averages]
        if (level.agents.length > 0) {
          const costs = level.agents.map(a => a.cost_per_hour).filter(c => c > 0)
          level.average_cost = costs.length > 0 ? 
            costs.reduce((sum, cost) => sum + cost, 0) / costs.length : 0
        }
      })

      // Create a single "All Agents" team
      analysis.teams.push({
        id: 0,
        name: 'All Agents (No Team Structure)',
        ticket_count: 0,
        agents: analysis.global_averages.level_1.agents
          .concat(analysis.global_averages.level_2.agents)
          .concat(analysis.global_averages.level_3.agents),
        level_costs: {
          level_1: { 
            agents: analysis.global_averages.level_1.agents, 
            average_cost: analysis.global_averages.level_1.average_cost, 
            count: analysis.global_averages.level_1.agents.length 
          },
          level_2: { 
            agents: analysis.global_averages.level_2.agents, 
            average_cost: analysis.global_averages.level_2.average_cost, 
            count: analysis.global_averages.level_2.agents.length 
          },
          level_3: { 
            agents: analysis.global_averages.level_3.agents, 
            average_cost: analysis.global_averages.level_3.average_cost, 
            count: analysis.global_averages.level_3.agents.length 
          }
        }
      })
      analysis.teams_processed = 1

      return analysis
    } catch (error) {
      console.error('Error processing direct agents:', error)
      return { error: error instanceof Error ? error.message : 'Processing error' }
    }
  }

  // Save team and agent data to database
  private async saveTeamAgentDataToDatabase(analysisData: any, isFallback: boolean): Promise<any> {
    try {
      console.log('Starting database save operation...')
      
      // Create sync log entry
      const syncLog = await prisma.haloSyncLog.create({
        data: {
          syncType: 'full',
          status: 'in_progress',
          recordsSync: 0,
          syncData: analysisData
        }
      })
      
      const result = {
        teams_saved: 0,
        agents_saved: 0,
        cost_analyses_saved: 0,
        sync_log_id: syncLog.id,
        errors: [] as string[]
      }

      // Save teams and agents
      for (const teamData of analysisData.teams) {
        try {
          // Upsert team
          const team = await prisma.haloTeam.upsert({
            where: { haloId: teamData.id },
            update: {
              name: teamData.name,
              ticketCount: teamData.ticket_count || 0,
              isActive: !teamData.inactive,
              updatedAt: new Date()
            },
            create: {
              haloId: teamData.id,
              name: teamData.name,
              ticketCount: teamData.ticket_count || 0,
              isActive: !teamData.inactive
            }
          })
          result.teams_saved++

          // Save agents for this team
          for (const agentData of teamData.agents || []) {
            try {
              await prisma.haloAgent.upsert({
                where: { haloId: agentData.id },
                update: {
                  name: agentData.name,
                  email: agentData.email,
                  level: agentData.level,
                  costPerHour: agentData.cost_per_hour,
                  isActive: agentData.is_active,
                  departmentId: agentData.department_id,
                  teamId: team.id,
                  rawData: agentData.raw_data,
                  updatedAt: new Date()
                },
                create: {
                  haloId: agentData.id,
                  name: agentData.name,
                  email: agentData.email,
                  level: agentData.level,
                  costPerHour: agentData.cost_per_hour,
                  isActive: agentData.is_active,
                  departmentId: agentData.department_id,
                  teamId: team.id,
                  rawData: agentData.raw_data
                }
              })
              result.agents_saved++
            } catch (agentError) {
              console.error(`Failed to save agent ${agentData.id}:`, agentError)
              result.errors.push(`Agent ${agentData.id}: ${agentError instanceof Error ? agentError.message : 'Unknown error'}`)
            }
          }

          // Save cost analysis for this team
          if (teamData.level_costs) {
            try {
              // Find existing record or create new one
              const existingAnalysis = await prisma.teamCostAnalysis.findFirst({
                where: { teamId: team.id }
              })

              if (existingAnalysis) {
                await prisma.teamCostAnalysis.update({
                  where: { id: existingAnalysis.id },
                  data: {
                    level1Count: teamData.level_costs.level_1?.count || 0,
                    level1AvgCost: teamData.level_costs.level_1?.average_cost || 0,
                    level2Count: teamData.level_costs.level_2?.count || 0,
                    level2AvgCost: teamData.level_costs.level_2?.average_cost || 0,
                    level3Count: teamData.level_costs.level_3?.count || 0,
                    level3AvgCost: teamData.level_costs.level_3?.average_cost || 0,
                    totalAgents: teamData.agents?.length || 0,
                    updatedAt: new Date()
                  }
                })
              } else {
                await prisma.teamCostAnalysis.create({
                  data: {
                    teamId: team.id,
                    level1Count: teamData.level_costs.level_1?.count || 0,
                    level1AvgCost: teamData.level_costs.level_1?.average_cost || 0,
                    level2Count: teamData.level_costs.level_2?.count || 0,
                    level2AvgCost: teamData.level_costs.level_2?.average_cost || 0,
                    level3Count: teamData.level_costs.level_3?.count || 0,
                    level3AvgCost: teamData.level_costs.level_3?.average_cost || 0,
                    totalAgents: teamData.agents?.length || 0
                  }
                })
              }
              result.cost_analyses_saved++
            } catch (analysisError) {
              console.error(`Failed to save cost analysis for team ${teamData.id}:`, analysisError)
              result.errors.push(`Cost analysis for team ${teamData.id}: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}`)
            }
          }
        } catch (teamError) {
          console.error(`Failed to save team ${teamData.id}:`, teamError)
          result.errors.push(`Team ${teamData.id}: ${teamError instanceof Error ? teamError.message : 'Unknown error'}`)
        }
      }

      // Update sync log with final status
      await prisma.haloSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: result.errors.length > 0 ? 'partial' : 'success',
          recordsSync: result.teams_saved + result.agents_saved,
          errorMessage: result.errors.length > 0 ? result.errors.join('; ') : null
        }
      })

      console.log('Database save completed:', result)
      return result
    } catch (error) {
      console.error('Failed to save to database:', error)
      
      // Try to create error log
      try {
        await prisma.haloSyncLog.create({
          data: {
            syncType: 'full',
            status: 'error',
            recordsSync: 0,
            errorMessage: error instanceof Error ? error.message : 'Unknown database error'
          }
        })
      } catch (logError) {
        console.error('Failed to create error log:', logError)
      }
      
      throw error
    }
  }

  // Sync service hours from HaloPSA templates
  async syncServiceHours(): Promise<any> {
    try {
      console.log('Starting service hours sync from templates...')
      
      // Step 1: Get all templates (basic list)
      console.log('Fetching templates list...')
      const templates = await this.getTemplates()
      console.log('Templates response:', templates)
      
      // Step 2: Get detailed data for each template (with estimates)
      console.log('Fetching detailed template data with estimates...')
      const detailedTemplates = await this.getDetailedTemplates(templates)
      
      // Step 3: Process templates for service hours
      const processedData = this.processTemplateHours(detailedTemplates)
      
      // Step 4: Save to database
      console.log('Saving template hours to database...')
      const savedData = await this.saveServiceHoursToDatabase(processedData)
      
      return {
        raw_templates: templates,
        detailed_templates: detailedTemplates,
        processed_analysis: processedData,
        database_result: savedData,
        sync_timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to sync service hours:', error)
      throw error
    }
  }

  // Get detailed template data with estimates for each template
  private async getDetailedTemplates(templatesResponse: any): Promise<any[]> {
    try {
      const templates = templatesResponse.templates || templatesResponse || []
      console.log(`Getting detailed data for ${templates.length} templates...`)
      
      const detailedTemplates = []
      
      for (const template of templates) {
        try {
          console.log(`Fetching details for template ${template.id}: ${template.name}`)
          const detailedTemplate = await this.getTemplate(template.id)
          detailedTemplates.push(detailedTemplate)
          
          // Add a small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`Failed to get details for template ${template.id}:`, error)
          // Still add the basic template data so we don't lose it
          detailedTemplates.push({ ...template, estimate: 0, fetch_error: true })
        }
      }
      
      console.log(`Successfully fetched detailed data for ${detailedTemplates.length} templates`)
      return detailedTemplates
    } catch (error) {
      console.error('Failed to get detailed templates:', error)
      throw error
    }
  }

  // Process templates into service hours structure
  private processTemplateHours(templatesData: any): any {
    try {
      const analysis = {
        templates: [] as any[],
        total_templates: 0,
        templates_with_hours: 0
      }

      // Process templates (handle different response structures)
      const templates = templatesData.templates || templatesData || []
      console.log('Processing', templates.length, 'templates for hours')
      
      templates.forEach((template: any) => {
        const hoursData = this.extractHoursFromTemplate(template)
        
        const processedTemplate = {
          halo_id: template.id,
          name: template.name || `Template ${template.id}`,
          description: template.description,
          level1_hours: hoursData.level1Hours,
          level2_hours: hoursData.level2Hours,
          level3_hours: hoursData.level3Hours,
          total_hours: hoursData.totalHours,
          template_type: 'ticket', // Default for HaloPSA templates
          category: template.category || 'General',
          raw_data: template
        }
        
        analysis.templates.push(processedTemplate)
        analysis.total_templates++
        
        if (hoursData.totalHours > 0) {
          analysis.templates_with_hours++
        }
      })

      console.log(`Processed ${analysis.total_templates} templates, ${analysis.templates_with_hours} with hour estimates`)
      return analysis
    } catch (error) {
      console.error('Error processing template hours:', error)
      return { error: error instanceof Error ? error.message : 'Processing error' }
    }
  }

  // Extract hours from template data
  private extractHoursFromTemplate(template: any): { level1Hours: number, level2Hours: number, level3Hours: number, totalHours: number } {
    // Look for various hour fields in template data
    let totalHours = 0
    
    // Check common hour fields from HaloPSA templates
    if (template.estimate) totalHours = parseFloat(template.estimate) || 0
    if (template.hours && !totalHours) totalHours = parseFloat(template.hours) || 0
    if (template.duration && !totalHours) totalHours = parseFloat(template.duration) || 0
    if (template.time_estimate && !totalHours) totalHours = parseFloat(template.time_estimate) || 0
    if (template.estimated_hours && !totalHours) totalHours = parseFloat(template.estimated_hours) || 0
    
    console.log(`Template ${template.id} (${template.name}): Found ${totalHours} total hours`)
    
    // Distribute hours across skill levels based on template complexity/category
    const distribution = this.getSkillLevelDistribution(template)
    
    const level1Hours = totalHours * distribution.level1Percent
    const level2Hours = totalHours * distribution.level2Percent  
    const level3Hours = totalHours * distribution.level3Percent
    
    return { level1Hours, level2Hours, level3Hours, totalHours }
  }

  // Determine skill level distribution based on template characteristics
  private getSkillLevelDistribution(template: any): { level1Percent: number, level2Percent: number, level3Percent: number } {
    const templateName = (template.name || '').toLowerCase()
    const category = (template.category || '').toLowerCase()
    
    // Senior-heavy tasks (70% L3, 20% L2, 10% L1)
    if (templateName.includes('architecture') || templateName.includes('design') || 
        templateName.includes('planning') || templateName.includes('strategy') ||
        category.includes('architecture')) {
      return { level1Percent: 0.1, level2Percent: 0.2, level3Percent: 0.7 }
    }
    
    // Junior-heavy tasks (60% L1, 30% L2, 10% L3)
    if (templateName.includes('basic') || templateName.includes('simple') || 
        templateName.includes('standard') || templateName.includes('routine')) {
      return { level1Percent: 0.6, level2Percent: 0.3, level3Percent: 0.1 }
    }
    
    // Intermediate-heavy tasks (20% L1, 60% L2, 20% L3) - Default
    return { level1Percent: 0.2, level2Percent: 0.6, level3Percent: 0.2 }
  }

  // Save service hours data to database
  private async saveServiceHoursToDatabase(analysisData: any): Promise<any> {
    try {
      console.log('Starting service hours database save...')
      
      // Create sync log
      const syncLog = await prisma.serviceHoursSyncLog.create({
        data: {
          syncType: 'templates',
          status: 'in_progress',
          recordsSync: 0,
          syncData: analysisData
        }
      })
      
      const result = {
        templates_saved: 0,
        sync_log_id: syncLog.id,
        errors: [] as string[]
      }

      // Save templates
      for (const templateData of analysisData.templates) {
        try {
          await prisma.haloServiceTemplate.upsert({
            where: { haloId: templateData.halo_id },
            update: {
              name: templateData.name,
              description: templateData.description,
              level1Hours: templateData.level1_hours,
              level2Hours: templateData.level2_hours,
              level3Hours: templateData.level3_hours,
              totalHours: templateData.total_hours,
              templateType: templateData.template_type,
              category: templateData.category,
              rawData: templateData.raw_data,
              updatedAt: new Date()
            },
            create: {
              haloId: templateData.halo_id,
              name: templateData.name,
              description: templateData.description,
              level1Hours: templateData.level1_hours,
              level2Hours: templateData.level2_hours,
              level3Hours: templateData.level3_hours,
              totalHours: templateData.total_hours,
              templateType: templateData.template_type,
              category: templateData.category,
              rawData: templateData.raw_data
            }
          })
          result.templates_saved++
        } catch (templateError) {
          console.error(`Failed to save template ${templateData.halo_id}:`, templateError)
          result.errors.push(`Template ${templateData.halo_id}: ${templateError instanceof Error ? templateError.message : 'Unknown error'}`)
        }
      }

      // Update sync log
      await prisma.serviceHoursSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: result.errors.length > 0 ? 'partial' : 'success',
          recordsSync: result.templates_saved,
          errorMessage: result.errors.length > 0 ? result.errors.join('; ') : null
        }
      })

      console.log('Service hours database save completed:', result)
      return result
    } catch (error) {
      console.error('Failed to save service hours to database:', error)
      throw error
    }
  }

  // Test creating a basic ticket without template to verify the format works
  async testBasicTicketCreation(): Promise<any> {
    try {
      // Get a valid client ID and examine existing tickets for valid category values
      const clients = await this.getClients(1)
      const clientId = clients.length > 0 ? clients[0].id : 1
      
      // Get existing tickets to see what category values are used
      const existingTickets = await this.getTickets({ count: 5, includeDetails: true })
      
      let validCategory1 = 'Incident' // Default fallback
      if (existingTickets.tickets && existingTickets.tickets.length > 0) {
        // Find a ticket with a valid category_1 value
        for (const ticket of existingTickets.tickets) {
          if (ticket.category_1 && ticket.category_1.trim() !== '') {
            validCategory1 = ticket.category_1
            console.log('Found valid category_1 from existing ticket:', validCategory1)
            break
          }
        }
      }
      
      const ticketData = {
        summary: 'Basic Test Ticket - API Format Test',
        details: 'Testing basic ticket creation to verify API format',
        client_id: clientId,
        // Required fields using values from existing tickets
        category_1: validCategory1,
        impact: 3, // Medium impact
        urgency: 3, // Medium urgency
        priority_id: 4 // Normal priority (common default)
      }
      
      console.log('Testing basic ticket creation with client_id:', clientId, 'and category_1:', validCategory1)
      const response = await this.createTicket(ticketData)
      return response
    } catch (error) {
      console.error('Failed to test basic ticket creation:', error)
      throw error
    }
  }

  // Create a new quote/opportunity
  async createQuote(quoteData: any): Promise<any> {
    try {
      // HaloPSA expects an array format for quote creation too
      const quoteArray = Array.isArray(quoteData) ? quoteData : [quoteData]
      
      const response = await this.makeApiRequest('/Quotation', {
        method: 'POST',
        body: JSON.stringify(quoteArray)
      })
      return response
    } catch (error) {
      console.error('Failed to create quote:', error)
      throw error
    }
  }

  // Test template ticket creation and analysis (skip quote for now)
  async testTemplateTicketAnalysis(templateId: number = 1): Promise<any> {
    try {
      console.log('Testing template ticket analysis with template_id:', templateId)
      
      // Step 1: Create a ticket from template
      const ticketResult = await this.testTemplateCreation(templateId)
      console.log('Created ticket from template:', ticketResult)
      
      if (!ticketResult || !ticketResult[0] || !ticketResult[0].id) {
        throw new Error('Failed to create ticket or get ticket ID')
      }
      
      const ticketId = ticketResult[0].id
      console.log('Ticket created with ID:', ticketId)
      
      // Step 2: Get the ticket details to see what template populated
      const ticketDetails = await this.getTicket(ticketId, { includeDetails: true })
      console.log('Ticket details after template creation:', ticketDetails)
      
      // Step 3: Analyze what fields got populated by the template
      const templateFields: { [key: string]: any } = {}
      const timeRelatedFields: { [key: string]: any } = {}
      
      Object.keys(ticketDetails).forEach(key => {
        const lowerKey = key.toLowerCase()
        const value = ticketDetails[key]
        
        // Look for time/hour/estimate fields
        if ((lowerKey.includes('time') || lowerKey.includes('hour') || 
             lowerKey.includes('estimate') || lowerKey.includes('duration')) && 
            value !== null && value !== undefined && value !== 0) {
          timeRelatedFields[key] = value
        }
        
        // Look for template-related fields
        if (lowerKey.includes('template') || lowerKey.includes('workflow') || 
            lowerKey.includes('sla') || lowerKey.includes('priority')) {
          templateFields[key] = value
        }
      })
      
      return {
        analysis_success: true,
        ticket_id: ticketId,
        template_id: templateId,
        ticket_details: ticketDetails,
        time_related_fields: timeRelatedFields,
        template_fields: templateFields,
        has_estimate: !!(ticketDetails.estimate && ticketDetails.estimate > 0),
        has_time_taken: !!(ticketDetails.timetaken && ticketDetails.timetaken > 0),
        workflow_id: ticketDetails.workflow_id,
        template_analysis: {
          template_id_set: ticketDetails.template_id === templateId,
          estimate_populated: ticketDetails.estimate > 0,
          workflow_assigned: ticketDetails.workflow_id > 0,
          custom_fields_count: ticketDetails.customfields ? Object.keys(ticketDetails.customfields).length : 0
        }
      }
      
    } catch (error) {
      console.error('Failed template ticket analysis:', error)
      return {
        analysis_success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        template_id: templateId
      }
    }
  }
}

// Export singleton instance
export const haloPSA = new HaloPSAClient()

// Export types for use in other files
export type { HaloTokenResponse, HaloApiConfig }