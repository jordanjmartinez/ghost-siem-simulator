# G.H.O.S.T.-SIEM-Simulation-Project
1. Introduction
2. Features
   
# Introduction

**G.H.O.S.T.** (Guided Help for Operations & Security Triage) is a full-stack **Security Information and Event Management** (SIEM) simulation that replicates a real-world **Security Operations Center** (SOC) environment. It includes real-time log ingestion, alert detection, incident reporting workflows, and interactive threat analytics. Designed for cybersecurity analyst training, scenario-based threat response, and demonstrating SOC processes in a hands-on setting.

# Features 

**G.H.O.S.T.** delivers an end-to-end SIEM simulation experience, replicating real-world SOC workflows through live alert generation, grouped threat patterns, analyst decision-making, and structured incident reporting. The platform includes performance analytics, a responsive UI with themed visuals, and seamless toggling between active threats and historical investigations — making it ideal for cybersecurity training, demonstrations, and portfolio showcase.

**Simulated Real-Time Alert Generation**
- Generates and streams security event logs with dynamic attack scenarios, including false positives, categorized by threat type and severity for realistic SOC training.

**Grouped Threat Detection & Pattern Recognition**
- Automatically clusters related logs by scenario ID, allowing analysts to triage threats based on contextual attack patterns instead of isolated events.

**Interactive Analyst Workflow Actions**
- Enables actionable decision-making through built-in analyst responses: Investigate, Escalate, and Dismiss, each triggering state changes and analytics updates.

**Structured Incident Reporting with Threat Classification**
- Empowers analysts to submit comprehensive incident reports including a custom title, severity rating, threat category, affected hosts, and recommended mitigation steps. Reports are stored with timestamps and displayed in a dedicated dashboard for audit and analysis.

## **Threat Analytics & Analyst Performance Scoring**
Includes a comprehensive analytics panel that provides real-time visibility into SIEM alert activity, displaying total alerts, critical alert counts, high severity rates, and analyst     performance metrics
  
   - A detailed Analyst Report Card showing key metrics:
     
        - Dismissed False Positives
        - Escalated True Threats
        - Misclassified Alerts
        - Total Actions
          
   - Features a real-time Performance Grade system (A–F) that evaluates analyst accuracy by calculating the ratio of correct actions — including dismissed false positives, escalated true       threats, and correct investigations — against misclassified alerts, and assigns a grade based on overall performance.
     
        - A: >= 90%
        - B: 80-89%
        - C: 70-79%
        - D: 60-69%
        - F: < 60%

![Analytics](./assets/ghost-siem-demo-3.png)

**SOC-Themed Interface with Visual Feedback**
- Delivers a responsive, dark-mode UI enhanced by ghost mascots, toast alerts, animations, and interactive elements to reflect triage status and user input in real time.

**Active & Past Incidents Threat View Toggle**
- Provides seamless switching between active scenarios and historical incident reports to reinforce audit trails and post-incident analysis.




# Interface Overview

## Events Tab  
This is the initial view of the dashboard. When the SOC analyst clicks **Simulate Logs**, the system generates and displays real-time logs in the event table. Selecting **Clear Logs** will remove all current log entries from the view.  

---
![Events Tab](./assets/ghost-siem-demo-1.png)

### Event Logs View  
Events display real-time logs as they are generated into the event table. Analysts can click on any log entry to expand detailed metadata including timestamp, source, hostname, and event type. This table is critical for identifying suspicious or malicious activity.  

![Event Logs](./assets/ghost-siem-demo-2.png)

### Analytics and Performance  
The Analytics tab provides a real-time overview of key metrics such as Total Alerts, Critical Alerts, and High Severity Rate. It also includes a performance report card that evaluates the analyst’s actions and assigns a grade based on investigation accuracy and response decisions.  

![Analytics](./assets/ghost-siem-demo-3.png)

### Patterns Tab  
The Patterns tab displays grouped alerts based on distinct threat scenarios. Each group aggregates related events that share a common pattern of suspicious activity, such as brute-force attempts, insider threats, or command-and-control behavior. Analysts can take action on each group by investigating, escalating, or resolving it, with all status changes reflected in the dashboard for continuous tracking and visibility.  

![Patterns Tab](./assets/ghost-siem-demo-4.png)


### Incident Report Form  
After completing an investigation, the analyst documents the findings by submitting an incident report. This includes selecting a threat category and severity level, describing the observed behavior, identifying the affected hosts, and outlining recommended mitigation steps. The report helps maintain an audit trail for response efforts and supports future threat analysis.  

![Incident Report](./assets/ghost-siem-demo-5.png)

### Reports Tab  
Shows all submitted incident reports in a structured format. Reports can be edited, exported, and reviewed at any time for audit and tracking purposes.  

![Reports Tab](./assets/ghost-siem-demo-6.png)

### Past Incidents 
The Past Incidents section of the Patterns tab displays all previously addressed scenarios, including those that were dismissed, escalated, or marked as under investigation. This view helps analysts review completed cases, understand prior decisions, and track how each threat was managed throughout the workflow.  

![Past Incidents](./assets/ghost-siem-demo-7.png)

