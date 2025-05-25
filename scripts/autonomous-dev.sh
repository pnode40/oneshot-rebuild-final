#!/bin/bash

# OneShot Autonomous Development System - Control Interface
# Version: 1.0 - Phase 1 Foundation
# 
# This script provides Eric with a simple command-line interface
# to manage the autonomous development system.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
CONTEXT_ENGINE="scripts/context-engine.js"
DOCS_DIR="docs"
SYSTEM_VERSION="1.0-foundation"

# Header function
show_header() {
    echo -e "${PURPLE}🤖 OneShot Autonomous Development System v${SYSTEM_VERSION}${NC}"
    echo -e "${CYAN}=================================================${NC}"
    echo ""
}

# Status display
show_status() {
    show_header
    echo -e "${BLUE}📊 System Status${NC}"
    echo ""
    
    if [[ -f "$DOCS_DIR/context-state.json" ]]; then
        local phase=$(cat "$DOCS_DIR/context-state.json" | grep -o '"system_phase": "[^"]*"' | cut -d'"' -f4)
        local session=$(cat "$DOCS_DIR/context-state.json" | grep -o '"session_id": "[^"]*"' | cut -d'"' -f4)
        echo -e "Phase: ${GREEN}$phase${NC}"
        echo -e "Session: ${GREEN}$session${NC}"
    else
        echo -e "Status: ${YELLOW}Not initialized${NC}"
    fi
    
    if [[ -f "$DOCS_DIR/autonomy-metrics.json" ]]; then
        local level=$(cat "$DOCS_DIR/autonomy-metrics.json" | grep -o '"current_level": [0-9]*' | cut -d':' -f2 | tr -d ' ')
        local success_rate=$(cat "$DOCS_DIR/autonomy-metrics.json" | grep -o '"implementation_success_rate": [0-9]*' | cut -d':' -f2 | tr -d ' ')
        echo -e "Autonomy Level: ${GREEN}$level${NC}"
        echo -e "Success Rate: ${GREEN}$success_rate%${NC}"
    fi
    
    # Check GitHub Actions status
    if git status >/dev/null 2>&1; then
        echo -e "Git Status: ${GREEN}Connected${NC}"
        if [[ -f ".github/workflows/autonomous-development.yml" ]]; then
            echo -e "GitHub Actions: ${GREEN}Configured${NC}"
        else
            echo -e "GitHub Actions: ${YELLOW}Not configured${NC}"
        fi
    else
        echo -e "Git Status: ${RED}Not a git repository${NC}"
    fi
    
    echo ""
}

# Initialize system
init_system() {
    show_header
    echo -e "${BLUE}🚀 Initializing Autonomous Development System${NC}"
    echo ""
    
    # Create session ID
    local session_id="eric-session-$(date +%s)"
    
    # Initialize Context Engine
    echo -e "Initializing Context Engine..."
    node "$CONTEXT_ENGINE" init "$session_id"
    
    # Create necessary directories
    mkdir -p "$DOCS_DIR"
    mkdir -p ".github/workflows"
    
    echo -e "${GREEN}✅ System initialized successfully${NC}"
    echo -e "Session ID: ${CYAN}$session_id${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Run: ${CYAN}./scripts/autonomous-dev.sh status${NC}"
    echo -e "2. Start development with autonomous oversight"
    echo -e "3. Monitor system via GitHub Actions"
    echo ""
}

# Track a decision
track_decision() {
    local decision_type="$1"
    local description="$2"
    
    if [[ -z "$decision_type" || -z "$description" ]]; then
        echo -e "${RED}Error: Decision type and description required${NC}"
        echo -e "Usage: $0 track <type> '<description>'"
        echo -e "Example: $0 track implementation 'Added user authentication'"
        exit 1
    fi
    
    echo -e "${BLUE}📝 Tracking Decision${NC}"
    echo -e "Type: ${CYAN}$decision_type${NC}"
    echo -e "Description: ${CYAN}$description${NC}"
    echo ""
    
    node "$CONTEXT_ENGINE" track-decision "$decision_type" "$description"
    
    echo -e "${GREEN}✅ Decision tracked successfully${NC}"
}

# Update metrics
update_metrics() {
    local success="${1:-true}"
    local escalated="${2:-false}"
    local security="${3:-false}"
    
    echo -e "${BLUE}📈 Updating Autonomy Metrics${NC}"
    echo -e "Success: ${CYAN}$success${NC}"
    echo -e "Escalated: ${CYAN}$escalated${NC}"
    echo -e "Security Incident: ${CYAN}$security${NC}"
    echo ""
    
    node "$CONTEXT_ENGINE" update-metrics "$success" "$escalated" "$security"
    
    echo -e "${GREEN}✅ Metrics updated successfully${NC}"
}

# Run quality gates manually
run_quality_gates() {
    show_header
    echo -e "${BLUE}🔍 Running Quality Gates${NC}"
    echo ""
    
    # TypeScript check
    echo -e "${YELLOW}Checking TypeScript...${NC}"
    if npm run type-check >/dev/null 2>&1; then
        echo -e "TypeScript: ${GREEN}✅ PASSED${NC}"
    else
        echo -e "TypeScript: ${RED}❌ FAILED${NC}"
    fi
    
    # Linting check
    echo -e "${YELLOW}Running linter...${NC}"
    if npm run lint >/dev/null 2>&1; then
        echo -e "Linting: ${GREEN}✅ PASSED${NC}"
    else
        echo -e "Linting: ${RED}❌ FAILED${NC}"
    fi
    
    # Test coverage check
    if command -v npm >/dev/null 2>&1 && npm run test:coverage >/dev/null 2>&1; then
        echo -e "Test Coverage: ${GREEN}✅ PASSED${NC}"
    else
        echo -e "Test Coverage: ${YELLOW}⚠️  NOT CONFIGURED${NC}"
    fi
    
    echo ""
}

# Generate system report
generate_report() {
    show_header
    echo -e "${BLUE}📋 System Report${NC}"
    echo ""
    
    local report_file="docs/system-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# OneShot Autonomous Development System Report
**Generated**: $(date)
**Version**: $SYSTEM_VERSION

## System Status
EOF
    
    if [[ -f "$DOCS_DIR/context-state.json" ]]; then
        echo "### Context Engine Status" >> "$report_file"
        echo "\`\`\`json" >> "$report_file"
        cat "$DOCS_DIR/context-state.json" >> "$report_file"
        echo "\`\`\`" >> "$report_file"
        echo "" >> "$report_file"
    fi
    
    if [[ -f "$DOCS_DIR/autonomy-metrics.json" ]]; then
        echo "### Autonomy Metrics" >> "$report_file"
        echo "\`\`\`json" >> "$report_file"
        cat "$DOCS_DIR/autonomy-metrics.json" >> "$report_file"
        echo "\`\`\`" >> "$report_file"
        echo "" >> "$report_file"
    fi
    
    echo "### Recent Git Activity" >> "$report_file"
    echo "\`\`\`" >> "$report_file"
    git log --oneline -n 10 >> "$report_file" 2>/dev/null || echo "No git history available" >> "$report_file"
    echo "\`\`\`" >> "$report_file"
    
    echo -e "${GREEN}✅ Report generated: ${CYAN}$report_file${NC}"
}

# Escalate issue
escalate_issue() {
    local issue_type="$1"
    local description="$2"
    
    if [[ -z "$issue_type" ]]; then
        echo -e "${RED}Error: Issue type required${NC}"
        echo -e "Usage: $0 escalate <security|architecture|performance|other> '<description>'"
        exit 1
    fi
    
    echo -e "${RED}🚨 ESCALATION TRIGGERED${NC}"
    echo -e "Type: ${YELLOW}$issue_type${NC}"
    echo -e "Description: ${YELLOW}$description${NC}"
    echo ""
    
    # Log escalation
    local escalation_log="docs/escalations.log"
    echo "$(date): $issue_type - $description" >> "$escalation_log"
    
    # Track in Context Engine
    node "$CONTEXT_ENGINE" track-decision "escalation" "Manual escalation: $issue_type - $description"
    
    echo -e "${YELLOW}⚠️  Escalation logged. Eric review required.${NC}"
    echo -e "Log: ${CYAN}$escalation_log${NC}"
}

# Emergency stop
emergency_stop() {
    show_header
    echo -e "${RED}🛑 EMERGENCY STOP ACTIVATED${NC}"
    echo ""
    
    # Create stop file
    touch ".autonomous-stop"
    
    # Log emergency stop
    echo "$(date): Emergency stop activated by Eric" >> "docs/escalations.log"
    
    echo -e "${YELLOW}⚠️  All autonomous operations halted${NC}"
    echo -e "${YELLOW}⚠️  Manual intervention required${NC}"
    echo ""
    echo -e "To resume: ${CYAN}rm .autonomous-stop${NC}"
}

# Show help
show_help() {
    show_header
    echo -e "${BLUE}Available Commands:${NC}"
    echo ""
    echo -e "${CYAN}System Management:${NC}"
    echo -e "  init                     Initialize the autonomous development system"
    echo -e "  status                   Show current system status"
    echo -e "  report                   Generate comprehensive system report"
    echo ""
    echo -e "${CYAN}Decision Tracking:${NC}"
    echo -e "  track <type> '<desc>'    Track a development decision"
    echo -e "  metrics [success] [esc]  Update autonomy metrics"
    echo ""
    echo -e "${CYAN}Quality Control:${NC}"
    echo -e "  quality                  Run quality gates manually"
    echo -e "  escalate <type> '<desc>' Escalate an issue to Eric"
    echo ""
    echo -e "${CYAN}Emergency:${NC}"
    echo -e "  stop                     Emergency stop all autonomous operations"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  $0 init"
    echo -e "  $0 track implementation 'Added user authentication'"
    echo -e "  $0 metrics true false false"
    echo -e "  $0 escalate security 'Potential vulnerability detected'"
    echo ""
}

# Main command dispatch
main() {
    case "${1:-help}" in
        "init")
            init_system
            ;;
        "status")
            show_status
            ;;
        "track")
            track_decision "$2" "$3"
            ;;
        "metrics")
            update_metrics "$2" "$3" "$4"
            ;;
        "quality")
            run_quality_gates
            ;;
        "report")
            generate_report
            ;;
        "escalate")
            escalate_issue "$2" "$3"
            ;;
        "stop")
            emergency_stop
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            echo -e "${RED}Unknown command: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Check for emergency stop
if [[ -f ".autonomous-stop" ]]; then
    echo -e "${RED}🛑 AUTONOMOUS OPERATIONS STOPPED${NC}"
    echo -e "${YELLOW}Remove .autonomous-stop file to resume${NC}"
    exit 1
fi

# Run main function
main "$@" 