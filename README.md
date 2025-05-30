# G.H.O.S.T. - A Full-Stack SOC Simulator for Cybersecurity Training

## Table of Contents

1. Introduction
2. Features
3. Installation & Setup
4. Use Cases
   
# Introduction

**G.H.O.S.T.** (Guided Help for Operations & Security Triage) is a full-stack **Security Information and Event Management** (SIEM) simulation that replicates a real-world **Security Operations Center** (SOC) environment.

It includes real-time log ingestion, alert detection, incident reporting, and threat analytics. Designed for cybersecurity analyst training, scenario-based threat response, and demonstrating a T1 SOC analyst workflow in a home-lab setting.

# Features 

**G.H.O.S.T.** delivers an end-to-end SIEM simulation experience, replicating real-world SOC workflows through live alert generation, grouped threat patterns, analyst decision-making, and structured incident reporting. The platform includes performance analytics, a responsive UI with themed visuals, and seamless toggling between active threats and past incidents — making it ideal for cybersecurity training, demonstrations, and portfolio showcase.

## **Simulated Real-Time Alert Generation**

![Events Tab](./assets/ghost-siem-demo-1.png)

Clicking on Simulate Events generates a stream of security event logs from various log sources (Firewall, Application) acting as normal event traffic in a SIEM environment.

After a couple of logs, an event will be injected into the SIEM mimicking an attack from a hacker

![Attack Scenario](./assets/ghost-siem-demo-9.png)

Each log entry includes a timestamp, event type, severity level, and descriptive message modeled after realistic enterprise scenarios. These include:

- Command & Control (C2) via DNS tunneling

- Persistence mechanisms using outbound DNS queries

- PowerShell execution with obfuscated arguments

- Suspicious HTTP requests to known malicious domains

- Login events simulating both valid and anomalous user behavior

The generated logs mimic the diversity and noise found in actual SIEM environments by mixing malicious activity, normal user behavior, and false positives — challenging analysts to distinguish between them accurately.

![Event Logs](./assets/ghost-siem-demo-2.png)

Displayed in the Events Tab, the interface supports:

- Live pagination and adjustable rows per page

- Search and filtering for specific logs by keyword

- A Simulate Events button that triggers a new batch of synthetic logs, including both benign and malicious behaviors

- A Clear Logs button that resets the event feed, removing all previously generated logs for a fresh session or scenario restart

This system forms the core of **G.H.O.S.T.’s** interactive alert simulation, offering a hands-on training loop for analysts to detect, classify, and respond to evolving threat patterns.

## **Threat Correlation & Scenario-Based Triage**
Automatically clusters related log entries into cohesive threat scenarios using a shared scenario ID, allowing analysts to investigate patterns of malicious activity rather than isolated events.
- Groups are formed based on predefined attack sequences, such as multi-step exploits (e.g., initial access → command execution → data exfiltration).

- Each group is labeled with a threat category and severity level to assist with triage and prioritization.

- Analysts can take decisive actions — Investigate, Escalate, or Dismiss — at the scenario level, enabling efficient triage and resolution of grouped threats:
  - **Investigate:** Launches the incident report workflow for in-depth analysis and documentation

  - **Escalate:** Flags the scenario as a confirmed threat, increasing critical alert counts and impacting performance metrics

  - **Dismiss:** Marks the scenario as a false positive, contributing to false positive tracking in the Analyst Report Card

- Grouped alerts are displayed in the Patterns Tab, which features a toggle view between:
     - **Active Threats:** Ongoing scenarios requiring analyst attention
       
     - **Past Incidents:** Resolved, escalated, or investigated threats, stored for audit trails and post-incident review

This approach mirrors how real-world SIEM platforms correlate events to detect and respond to complex, multi-stage attacks.

![Patterns Tab](./assets/ghost-siem-demo-4.png)

![Past Incidents](./assets/ghost-siem-demo-7.png)


## **Incident Reporting & Threat Categorization**
Enables analysts to submit professional-grade incident reports that capture key investigation details for audit, triage, and post-incident review.

Includes an Incident Report Form with the following fields
  
   - Title
       
   - Description
       
   - Severity
       
   - Category
       
   - Affected Hosts
       
   - Mitigation Steps
       
   - Status
 
![Incident Report](./assets/ghost-siem-demo-5.png)

Each report is timestamped and stored for review, and displayed in the Reports Tab, where analysts can:
   
   - View and manage reports
        
   - Edit report details
        
   - Export reports for documentation and incident tracking

 ![Reports Tab](./assets/ghost-siem-demo-6.png)

## **Threat Analytics & Analyst Performance Scoring**
Includes a comprehensive analytics panel that provides real-time visibility into SIEM alert activity, displaying total alerts, critical alert counts, high severity rates, and analyst performance metrics
  
A detailed Analyst Report Card showing key metrics:
     
  - Dismissed False Positives
    
  - Escalated True Threats
    
  - Misclassified Alerts
    
  - Total Actions
          
Features a real-time Performance Grade system (A–F) that evaluates analyst accuracy by calculating the ratio of correct actions — including dismissed false positives, escalated true threats, and                correct investigations — against misclassified alerts, and assigns a grade based on overall performance.

   **Grade Scale:**
   - A: >= 90%
        
   - B: 80-89%
        
   - C: 70-79%
        
   - D: 60-69%
        
   - F: < 60%

![Analytics](./assets/ghost-siem-demo-3.png)

## **Immersive Analyst Interface & Themed UX**
Delivers a responsive, dark-mode UI enhanced by ghost mascots, toast alerts, animations, and interactive elements to reflect triage status and user input in real time.

- Ghost-themed mascot that provide motivational and contextual feedback based on analyst performance
  
- Toast alerts and real-time visual indicators tied to analyst actions and scenario status

- A consistent, high-contrast design that mirrors professional-grade SOC tooling while adding an immersive training experience

 ![Visual](./assets/ghost-siem-demo-10.png)


# Installation & Setup

Follow these steps to run **G.H.O.S.T.** locally on your machine:

1. Clone the repository
   
   ```
   git clone https://github.com/your-username/ghost-siem-simulator.git
   cd ghost-siem-simulator
   
3. Setup the backend
   
   ```
   cd backend
   pip install -r requirements.txt
   python app.py

Flask server will start at: http://localhost:5000

3. Setup the frontend UI

   ```
   cd frontend
   npm install
   npm start

4. Launch the simulator

   ``` Open your browser

   http://localhost:5173

 # Use Cases

**G.H.O.S.T.** is built for cybersecurity students, entry-level analysts, and anyone looking to gain hands-on experience with real-world SOC workflows. Whether you're preparing for a blue team role or building a cybersecurity portfolio, this simulation helps you practice threat detection, incident triage, and reporting in a controlled, interactive environment.
 
- Practice analyst workflows in a simulated SOC environment
  
- Demonstrate threat detection and incident response skills
  
- Train new blue team members or students in realistic triage scenarios
  
- Showcase full-stack security engineering capabilities in a portfolio project


