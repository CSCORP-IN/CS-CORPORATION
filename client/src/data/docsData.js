import { wasMonitoringDocsPages } from './wasMonitoringDocsData.js';
import { mcpAgentDocsPages } from './mcpAgentDocsData.js';
import { maximoChatbotPages } from './maximoChatbotDocsData.js';
import { bulkJenkinsDocsPages } from './bulkJenkinsDocsData.js';
import { mifDocsToc, mifDocsPages } from './mifDocsData.js';
import { customConditionCronDocsToc, customConditionCronDocsPages } from './customConditionCronDocsData.js';
import { dbConfigStructuralDocsToc, dbConfigStructuralDocsPages } from './dbConfigStructuralDocsData.js';

// Master Documentation Table of Contents (9 Chapters)
export const docsToc = [
  ...[
  {
    "id": "sectionPart1",
    "title": "1. WebSphere PMI Metrics",
    "title_hi": "1. WebSphere PMI Metrics",
    "items": [
      {
        "id": "step0",
        "label": "1.1: Install Tools",
        "label_hi": "1.1: Install Tools"
      },
      {
        "id": "step1",
        "label": "1.2: Enable PMI",
        "label_hi": "1.2: Enable PMI"
      },
      {
        "id": "step2",
        "label": "1.3: Deploy metrics.ear",
        "label_hi": "1.3: Deploy metrics.ear"
      },
      {
        "id": "step3",
        "label": "1.4: Setup Prometheus",
        "label_hi": "1.4: Setup Prometheus"
      },
      {
        "id": "pmi-troubleshoot",
        "label": "1.5: Troubleshooting & Checklist",
        "label_hi": "1.5: Troubleshooting & Checklist"
      }
    ]
  },
  {
    "id": "sectionPart2",
    "title": "2. WebSphere Logs (Loki)",
    "title_hi": "2. WebSphere Logs (Loki)",
    "items": [
      {
        "id": "step4",
        "label": "2.1: Setup Loki & Logs",
        "label_hi": "2.1: Setup Loki & Logs"
      },
      {
        "id": "step5",
        "label": "2.2: Visualizations",
        "label_hi": "2.2: Visualizations"
      },
      {
        "id": "logs-troubleshoot",
        "label": "2.3: Troubleshooting & Checklist",
        "label_hi": "2.3: Troubleshooting & Checklist"
      }
    ]
  },
  {
    "id": "sectionPart3",
    "title": "3. AI Agent Integration (MCP)",
    "title_hi": "3. AI Agent Integration (MCP)",
    "items": [
      {
        "id": "ai-overview",
        "label": "3.1: AI & MCP Overview",
        "label_hi": "3.1: AI & MCP Overview"
      },
      {
        "id": "ai-step1",
        "label": "3.2: Service Account",
        "label_hi": "3.2: Service Account"
      },
      {
        "id": "ai-step2",
        "label": "3.3: Connection Config",
        "label_hi": "3.3: Connection Config"
      },
      {
        "id": "ai-step3",
        "label": "3.4: MCP Settings",
        "label_hi": "3.4: MCP Settings"
      },
      {
        "id": "ai-step4",
        "label": "3.5: Verify Integration",
        "label_hi": "3.5: Verify Integration"
      },
      {
        "id": "mcp-checklist",
        "label": "3.6: Verification Checklist",
        "label_hi": "3.6: Verification Checklist"
      }
    ]
  },
  {
    "id": "sectionPart4",
    "title": "4. Maximo Chatbot (REST)",
    "title_hi": "4. Maximo Chatbot (REST)",
    "items": [
      {
        "id": "chatbot-overview",
        "label": "4.1: Chatbot & REST Overview",
        "label_hi": "4.1: Chatbot & REST Overview"
      },
      {
        "id": "chatbot-audit",
        "label": "4.2: Audit Logs Setup",
        "label_hi": "4.2: Audit Logs Setup"
      },
      {
        "id": "chatbot-query-wo",
        "label": "4.3: Query Work Orders",
        "label_hi": "4.3: Query Work Orders"
      },
      {
        "id": "chatbot-create-sr",
        "label": "4.4: Create Service Requests",
        "label_hi": "4.4: Create Service Requests"
      },
      {
        "id": "chatbot-create-wo-update",
        "label": "4.5: Create WO & Update Records",
        "label_hi": "4.5: Create WO & Update Records"
      },
      {
        "id": "chatbot-query-sr",
        "label": "4.6: Query Service Requests",
        "label_hi": "4.6: Query Service Requests"
      },
      {
        "id": "chatbot-user-secgroup",
        "label": "4.7: User & Security Groups",
        "label_hi": "4.7: User & Security Groups"
      },
      {
        "id": "chatbot-labor-craft",
        "label": "4.8: Labor & Craft Mapping",
        "label_hi": "4.8: Labor & Craft Mapping"
      },
      {
        "id": "chatbot-checklist",
        "label": "4.9: Integration Checklist",
        "label_hi": "4.9: Integration Checklist"
      },
      {
        "id": "chatbot-download-config",
        "label": "4.10: Code & Environment Setup",
        "label_hi": "4.10: Code & Environment Setup"
      },
      {
        "id": "chatbot-nlu-development",
        "label": "4.11: NLU Model Development",
        "label_hi": "4.11: NLU Model Development"
      },
      {
        "id": "chatbot-oslc-troubleshoot",
        "label": "4.12: OSLC Security & Troubleshooting",
        "label_hi": "4.12: OSLC Security & Troubleshooting"
      }
    ]
  },
  {
    "id": "sectionPart5",
    "title": "5. Bulk DBC Generator",
    "title_hi": "5. Bulk DBC Generator",
    "items": [
      {
        "id": "bulk-overview",
        "label": "5.1: Bulk Generator Overview",
        "label_hi": "5.1: Bulk Generator Overview"
      },
      {
        "id": "bulk-excel-spec",
        "label": "5.2: Excel Template Structure",
        "label_hi": "5.2: Excel Template Structure"
      },
      {
        "id": "bulk-run-guide",
        "label": "5.3: Run & Setup Tutorial",
        "label_hi": "5.3: Run & Setup Tutorial"
      },
      {
        "id": "bulk-codes",
        "label": "5.4: Full Web App Code",
        "label_hi": "5.4: Full Web App Code"
      }
    ]
  },
  {
    "id": "sectionPart6",
    "title": "6. Jenkins Setup",
    "title_hi": "6. Jenkins Setup",
    "items": [
      {
        "id": "jenkins-setup",
        "label": "6.1: Jenkins (Java 8 Environment)",
        "label_hi": "6.1: Jenkins (Java 8 Environment)"
      }
    ]
  }
],
  mifDocsToc,
  customConditionCronDocsToc,
  dbConfigStructuralDocsToc
];

export const overviewPage = {
  "id": "overview",
  "title": "Chaudhary Documentation",
  "title_hi": "Chaudhary Documentation",
  "subtitle": "Select a tutorial below to configure WAS Traditional monitoring, AI Agent (MCP), Maximo REST chatbot, Bulk DBC Generator, MIF Automation scripts, Custom Conditions & Cron Tasks, or DB Config Architecture.",
  "subtitle_hi": "WAS Traditional monitoring, AI Agent (MCP), Maximo REST chatbot, Bulk DBC Generator, MIF Automation scripts, Custom Conditions & Cron Tasks, ya DB Config Architecture configure karne ke liye niche tutorials select karein.",
  "html": "<h1>Chaudhary Documentation</h1>\n<p class=\"page-subtitle\">Select a tutorial below to configure WAS Traditional monitoring, AI Agent (MCP), Maximo REST chatbot, Bulk DBC Generator, MIF Automation scripts, Custom Conditions &amp; Cron Tasks, or DB Config Architecture.</p>\n\n<section>\n  <h2>Available Tutorials</h2>\n  <p>This Knowledge Center contains modular, step-by-step guides for systems engineers. Select a tutorial topic from the launchpad below to begin. As our configuration footprint grows, new modules will be appended here.</p>\n  \n  <div class=\"portal-grid\">\n    \n    <!-- Topic 1 Card -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('step1')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-gauge-high\"></i>\n          <span>Setup Grafana with WebSphere PMI</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        Enable WAS Performance Monitoring Infrastructure (PMI), deploy the native metrics exporter Web Application Archive (metrics.ear), and configure Prometheus to scrape live system metrics. Refer to chapter 1.\n      </div>\n    </div>\n\n    <!-- Topic 2 Card -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('step4')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-list-check\"></i>\n          <span>Setup Grafana with WebSphere Logs</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        Configure log aggregation for WebSphere Console Out files (SystemOut.log) using Grafana Loki as the log database and Promtail as the log shipper on Windows. Refer to chapter 2.\n      </div>\n    </div>\n\n    <!-- Topic 3 Card -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('ai-overview')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-brain\"></i>\n          <span>Setup Grafana with AI using MCP Server</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        Securely link your Grafana metrics databases and Loki logs to AI Coding Copilots via the Model Context Protocol (MCP) in VS Code to ask the AI agent for live diagnostics. Refer to chapter 3.\n      </div>\n    </div>\n\n    <!-- Topic 4 Card -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('chatbot-overview')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-comments\"></i>\n          <span>Setup Maximo Chatbot REST Integration</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        Deploy a standalone, rule-based chatbot UI that queries and creates records in IBM Maximo using official OSLC REST Integration services. Features follow-up dialog mapping and full audit trace logs. Refer to chapter 4.\n      </div>\n    </div>\n\n    <!-- Topic 5 Card -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('bulk-overview')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-file-excel\"></i>\n          <span>Setup Maximo Bulk DBC Generator</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        Deploy a local Flask-based web application to upload spreadsheet components, connect to Maximo DB, run script validation/lookups, and bulk-generate compressed Database Configuration (DBC) XML files. Refer to chapter 5.\n      </div>\n    </div>\n\n    <!-- Topic 6 Card -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('jenkins-setup')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-cogs\"></i>\n          <span>Setup Jenkins (Java 8 Environment)</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        Install and configure modern Jenkins using a portable Java 17/21 runtime without modifying the system Java 8 used by Maximo servers. Refer to chapter 6.\n      </div>\n    </div>\n\n    <!-- Topic 7 Card (Maximo Integration Scripts) -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('mif-arch')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-code\"></i>\n          <span>IBM Maximo Integration Scripts (MIF)</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        Master Inbound/Outbound Object Structures (OSIN/OSOUT), Dynamic OSQUERY, Custom OSACTION RPC, User &amp; External Exits, Event Filters, and Script Router Handlers in Jython/Python. Refer to chapter 7.\n      </div>\n    </div>\n\n    <!-- Topic 8 Card (Conditions & Cron Tasks) -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('custom-conditions-intro')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-bolt\"></i>\n          <span>Custom Conditions, Cron Tasks &amp; Actions</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        Deep-dive into ScriptCustomCondition.java, ScriptCrontask.java, and ScriptAction.java. Implement real-time conditions, scheduled batch jobs, and workflow action lines in Jython. Refer to chapter 8.\n      </div>\n    </div>\n\n    <!-- Topic 9 Card (DB Config Structural vs Non-Structural) -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('dbconfig-overview-engine')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-database\"></i>\n          <span>Maximo DB Config: Structural vs Non-Structural</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        Master ConfigureService.getConfigLevel decision algorithms, structural (Level 2) table rebuilds, non-structural (Level 1) live refresh, and 7 critical exceptions like E-Audit and Secondary Indexes. Refer to chapter 9.\n      </div>\n    </div>\n\n  </div>\n</section>",
  "html_hi": "<h1>Chaudhary Documentation</h1>\n<p class=\"page-subtitle\">WAS Traditional monitoring, AI Agent (MCP), Maximo REST chatbot, Bulk DBC Generator, MIF Automation scripts, Custom Conditions &amp; Cron Tasks, ya DB Config Architecture configure karne ke liye niche tutorials select karein.</p>\n\n<section>\n  <h2>Available Tutorials (Launchpad)</h2>\n  <p>Yeh Knowledge Center systems engineers aur Maximo developers ke liye modular, step-by-step guides provide karta hai. Shuru karne ke liye niche diye gaye launchpad se koi bhi topic select karein:</p>\n  \n  <div class=\"portal-grid\">\n    \n    <!-- Topic 1 Card -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('step1')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-gauge-high\"></i>\n          <span>WebSphere PMI ke sath Grafana Setup</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        WAS Performance Monitoring Infrastructure (PMI) enable karein, native metrics exporter (metrics.ear) deploy karein, aur Prometheus ke through live telemetry scrape karein. Chapter 1 dekhein.\n      </div>\n    </div>\n\n    <!-- Topic 2 Card -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('step4')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-list-check\"></i>\n          <span>WebSphere Logs ke sath Grafana Loki Setup</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        SystemOut.log files ko aggregate karne ke liye Grafana Loki database aur Promtail log shipper Windows par configure karein. Chapter 2 dekhein.\n      </div>\n    </div>\n\n    <!-- Topic 3 Card -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('ai-overview')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-brain\"></i>\n          <span>MCP Server ke sath Grafana AI Integration</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        Model Context Protocol (MCP) ke through Grafana metrics aur Loki logs ko AI Coding Copilot se connect karein aur live AI diagnostics execute karein. Chapter 3 dekhein.\n      </div>\n    </div>\n\n    <!-- Topic 4 Card -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('chatbot-overview')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-comments\"></i>\n          <span>Maximo Chatbot REST Integration Setup</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        IBM Maximo OSLC REST APIs ke sath full-featured chatbot deploy karein jo Work Orders, Service Requests query aur create karta hai. Chapter 4 dekhein.\n      </div>\n    </div>\n\n    <!-- Topic 5 Card -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('bulk-overview')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-file-excel\"></i>\n          <span>Maximo Bulk DBC Generator Setup</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        Excel spreadsheets upload karke instant compressed Database Configuration (DBC) XML scripts generate karne wala local Flask web app. Chapter 5 dekhein.\n      </div>\n    </div>\n\n    <!-- Topic 6 Card -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('jenkins-setup')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-cogs\"></i>\n          <span>Jenkins Setup (Java 8 Environment)</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        Maximo Java 8 ko disturb kiye bina portable Java 17/21 runtime ke sath modern Jenkins install aur automate karein. Chapter 6 dekhein.\n      </div>\n    </div>\n\n    <!-- Topic 7 Card (Maximo Integration Scripts) -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('mif-arch')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-code\"></i>\n          <span>IBM Maximo Integration Framework (MIF) Scripts</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        Inbound/Outbound Object Structures (OSIN/OSOUT), Dynamic OSQUERY, Custom OSACTION RPC, User &amp; External Exits, Event Filters aur Script Router Handlers. Chapter 7 dekhein.\n      </div>\n    </div>\n\n    <!-- Topic 8 Card (Conditions & Cron Tasks) -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('custom-conditions-intro')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-bolt\"></i>\n          <span>Custom Conditions, Cron Tasks &amp; Actions</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        ScriptCustomCondition.java, ScriptCrontask.java, aur ScriptAction.java ka deep-dive. Real-time conditions, scheduled batch jobs, aur workflow action lines Jython me implement karein. Chapter 8 dekhein.\n      </div>\n    </div>\n\n    <!-- Topic 9 Card (DB Config Structural vs Non-Structural) -->\n    <div class=\"portal-card\" onclick=\"navigateToHash('dbconfig-overview-engine')\">\n      <div class=\"portal-card-header\">\n        <div class=\"portal-card-title\">\n          <i class=\"fa-solid fa-database\"></i>\n          <span>Maximo DB Config: Structural vs Non-Structural</span>\n        </div>\n        <i class=\"fa-solid fa-arrow-right portal-card-arrow\"></i>\n      </div>\n      <div class=\"portal-card-desc\">\n        ConfigureService.getConfigLevel decision algorithms, structural (Level 2) table rebuilds, non-structural (Level 1) live refresh, aur E-Audit / Secondary Indexes ke 7 special exceptions. Chapter 9 dekhein.\n      </div>\n    </div>\n\n  </div>\n</section>"
};

export const docsPages = {
  overview: overviewPage,
  ...wasMonitoringDocsPages,
  ...mcpAgentDocsPages,
  ...maximoChatbotPages,
  ...bulkJenkinsDocsPages,
  ...mifDocsPages,
  ...customConditionCronDocsPages,
  ...dbConfigStructuralDocsPages
};
