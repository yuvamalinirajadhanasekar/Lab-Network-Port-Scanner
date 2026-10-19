# Lab Network Port Scanner
## Live Demo 
🚀 Try the website:https://lab-network-port-scanner.onrender.com

## 1. Introduction and Project Overview

The Lab Network Port Scanner is a network monitoring project designed to help laboratory administrators identify which computers are active and which network services are available in a computer laboratory.

In a college computer lab, many computers are connected to the same local area network (LAN). Administrators may need to check whether these computers are online and whether important services are accessible. Checking every computer manually can be time-consuming, especially when the laboratory contains many systems.

This project proposes a tool that automatically discovers active devices, scans predefined network service ports, and displays device and service information through a centralized dashboard.

### Motivation and domain introduction

The project focuses on computer networking, device discovery, port scanning, and network monitoring.

Its main functions are:

- Automatically discover devices connected to the laboratory network.
- Identify online and offline computers.
- Scan predefined service ports.
- Detect available and unavailable services.
- Display device and service status on a centralized dashboard.
- Maintain scan results for monitoring.

### Example

Imagine a college laboratory containing 50 computers. An administrator wants to check which computers are reachable and whether a required web service is accessible.

Instead of checking every computer individually, the administrator can use the proposed scanner to obtain a consolidated view of device availability and service status.

The scanner should only be used on networks and devices for which the administrator has permission.

## 2. Problem Statement and Objectives

### Problem statement

Laboratory administrators may manually check computers to determine their availability. When multiple systems are involved, identifying offline devices becomes time-consuming.

Another important problem is that a computer being online does not necessarily mean that its services are available. For example, a computer might respond to network requests while its web server is stopped.

Basic network tools may provide individual results, but the project identifies the lack of a centralized, laboratory-specific live device and service dashboard as a limitation.

### Research goal

To develop a network monitoring tool that helps laboratory administrators discover devices, check predefined service ports, and view device and service availability through a centralized dashboard.

### Objectives

Device discovery: Identify computers that are reachable on the authorized laboratory network.

Online and offline identification: Categorize devices based on the scanner's detection method.

Port scanning: Check predefined service ports to determine whether they appear open or closed.

Service availability: Display the results of port checks to help administrators understand which services are accessible.

Centralized dashboard: Present device information and service status in an easy-to-read interface.

Scan history: Maintain scan results so administrators can review network status over time, if historical storage is implemented.

### Important technical distinction

A device being online and a service being available are two different things.

- Device availability: Can the computer be reached using the chosen discovery method?
- Port availability: Does a connection attempt to a specified TCP port succeed?
- Service availability: Is the expected service actually responding correctly?

A successful port connection does not always prove that the application is functioning correctly. Similarly, a failed ping does not necessarily mean a computer is offline, because some devices block ping requests.

## 3. Literature Review and Existing System Analysis

### Literature review

The PDF lists three research works related to network scanning. Their stated advantages and limitations are summarized below.

| Research work                                                   | Main focus                                               | Advantage                                | Limitation for this project                                                       |
| --------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------- |
| ZMap: Fast Internet-wide Scanning and Its Security Applications | Large-scale IPv4 network scanning                        | Very fast scanning                       | Primarily designed for Internet-scale scanning rather than laboratory monitoring. |
| A Comparative Analysis of Port Scanning Tool Efficacy           | Comparing scanning tools such as Nmap, ZMap, and Masscan | Compares scanner accuracy and efficiency | Focuses on scanner comparison rather than a live laboratory dashboard.            |
| The Design of Large Scale IP Address and Port Scanning Tool     | Large-scale IP address and port scanning                 | Emphasizes high-concurrency scanning     | Focuses on large-scale scanning rather than centralized lab monitoring.           |

These are the titles and key points presented in the PDF. The presentation does not provide full author details, publication years, or complete citations, so those details would need to be verified before preparing a formal research bibliography.

### Existing system

The PDF identifies three main approaches currently used for monitoring computers.

Manual checking: Administrators inspect computers individually. This can be slow when many devices need to be checked.

Ping-based tools: These tools check basic network reachability. However, they do not necessarily tell administrators whether a particular service is available.

Standalone port scanners: These tools can provide port-scanning results, but administrators may need to examine results separately rather than using a laboratory-specific dashboard.

### Limitations of the existing system

- Manual checking requires considerable effort.
- Basic reachability checks do not establish service availability.
- Scanning results may be distributed across different tools.
- Continuous service monitoring is limited in the approaches described.
- Administrators may lack a single interface showing device-wise port status.

### Proposed improvement

The Lab Network Port Scanner combines device discovery, predefined port checks, and a centralized dashboard. The aim is to make monitoring more organized and easier to understand.

## 4. System Architecture and Technical Working

The system architecture explains how the user interface, scanning backend, network, and results work together.

Lab Administrator

Starts scans and views results

Frontend Dashboard

HTML, CSS, JavaScript, Bootstrap

Device table, search, filters and status indicators

REST API

Receives scan requests and returns results

Scanner Backend

Device discovery, port checks and result processing

Authorized Lab Network

Computers and their network services

Scan Results / Storage

Device information, port status and scan history

This is a conceptual architecture based on the functions in your PDF. The PDF does not identify a specific backend language, database, or scanning library, and the storage component depends on implementation.

### How the system works

Step 1 — Start a scan

The administrator initiates a scan through the dashboard. The frontend sends a request to the backend through an API.

Step 2 — Discover devices

The scanner checks the authorized network using the configured discovery method. Devices that respond according to that method are recorded as discovered devices.

Step 3 — Check predefined ports

The backend checks selected ports on the discovered devices. A port is associated with a particular network service or application.

For example, TCP port 80 is commonly associated with HTTP, while TCP port 443 is commonly associated with HTTPS. The port number alone does not guarantee that the corresponding service is working correctly.

Step 4 — Process scan results

The backend organizes the results, including device addresses and port states, into a format that the frontend can display.

Step 5 — Display the results

The dashboard presents the device list, online and offline counts, and available or unavailable service information.

Step 6 — Review results

If scan history is implemented, administrators can review previous results to identify changes in device or service availability.

### Key networking concepts

| Concept            | Explanation                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| IP address         | Identifies a network interface on an IP network.                                                 |
| LAN                | A local area network connecting devices within a limited area, such as a computer lab.           |
| Port               | A numbered communication endpoint used by transport-layer protocols such as TCP and UDP.         |
| Port scanning      | Checking selected ports to determine their observed network state.                               |
| TCP                | A transport protocol that provides a connection-oriented, reliable byte stream.                  |
| REST API           | An HTTP-based interface that allows the frontend and backend to exchange requests and responses. |
| Network monitoring | Observing device and service availability to help identify problems.                             |

## 5. UI/UX Design, API Integration and Frontend Development

### UI/UX design

The user interface should present network information clearly so that administrators can identify problems quickly.

The PDF identifies these dashboard components:

| Dashboard component     | Purpose                                                                         |
| ----------------------- | ------------------------------------------------------------------------------- |
| Total devices           | Shows the number of devices recorded by the scanner.                            |
| Online devices          | Shows devices detected as reachable.                                            |
| Offline devices         | Shows devices not detected as reachable by the configured method.               |
| Active services         | Shows services or ports identified as available under the scanner's criteria.   |
| Inactive services       | Shows services or ports identified as unavailable under the scanner's criteria. |
| Device-wise port status | Displays port information for individual devices.                               |

The proposed interface also includes status-based visual indicators, search and filtering by IP address or device, and an easy-to-read device table.

A well-designed dashboard helps administrators identify the device they need to investigate without manually examining every scan result.

### API integration

The PDF lists the following API functions:

- Start a network scan.
- Fetch discovered devices.
- Fetch port status.
- Fetch service availability.
- Retrieve scan results.

The proposed communication flow is:

Frontend → REST API → Scanner Backend → Network → Response → Dashboard

For example, the frontend may request a scan, the backend performs the authorized checks, and the results are returned to the dashboard.

The PDF does not specify exact API endpoint URLs, HTTP methods, request schemas, or response formats. Those would need to be defined during implementation.

### Frontend development

The suggested frontend technologies are:

- HTML: Creates the dashboard structure and device table.
- CSS: Controls the visual design and status indicators.
- JavaScript: Sends API requests, processes responses, and updates displayed results.
- Bootstrap: Provides responsive layouts and reusable interface components.

The dashboard is intended to support search, filtering, device status display, port and service status display, and real-time or periodic status updates.

Periodic updates require the frontend or backend to schedule repeated checks. A dashboard that only displays the results of a manually initiated scan should not be described as continuously monitoring the network.

## 6. Client-Side and Server-Side Scripting, Sustainability and Conclusion

### Client-side scripting

Client-side scripting runs in the user's browser. In this project, JavaScript can:

- Display the monitoring dashboard.
- Send scan and status requests to the API.
- Show device and service availability.
- Search and filter device records.
- Update the interface when new results arrive.

For example, an administrator can search for a particular IP address in the device table rather than reading through the entire list.

Client-side code is responsible for presentation and interaction, but it should not be trusted to enforce security permissions by itself.

### Server-side scripting

Server-side scripting runs on the backend. The PDF identifies these responsibilities:

- Performing device discovery.
- Executing port scans.
- Processing scan results.
- Providing results through APIs.

The backend is the appropriate place to validate scan requests, enforce authorization, restrict scans to approved network ranges, and manage the scanning process.

For example, when the administrator starts a scan, the backend checks whether the requested network is permitted, runs the configured checks, processes the results, and returns the information to the dashboard.

The PDF does not specify the backend programming language or framework.

### Sustainability goal

The project identifies SDG 9 — Industry, Innovation and Infrastructure.

It supports this goal by aiming to improve the management and reliability of digital infrastructure through automated laboratory network monitoring.

The expected contributions include:

- More efficient digital infrastructure management.
- Automation of repetitive laboratory monitoring tasks.
- Improved visibility into network device and service availability.
- Reduced manual effort in checking laboratory computers.

These are intended contributions; the PDF does not include measured energy savings, maintenance-cost reductions, or other quantified sustainability results.

### Conclusion

The Lab Network Port Scanner proposes a centralized solution for monitoring computers and services in a laboratory network. By combining device discovery, predefined port scanning, API integration, and a dashboard, it aims to reduce the effort involved in manual checking and make network status easier to understand.

The distinction between device reachability and service availability is central to the project. A useful implementation should display scan results clearly, handle failures appropriately, enforce authorization, and restrict scanning to networks the administrator is permitted to monitor.

The proposed system can provide a foundation for more organized laboratory network management, with its actual effectiveness depending on the quality of implementation, testing, and monitoring configuration.
