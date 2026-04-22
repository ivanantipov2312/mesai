"""
Seed script — populates courses, skills, and career paths.
Called on startup if tables are empty.
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.course import Course
from app.models.skill import Skill
from app.models.career_path import CareerPath
from app.models.event import Event

# ---------------------------------------------------------------------------
# Skills
# ---------------------------------------------------------------------------

SKILLS = [
    # Security
    {"skill_id": "network_security", "name": "Network Security", "category": "Security",
     "description": "Secure network infrastructure and detect threats",
     "levels": {"1": "Understands firewalls and VPNs", "3": "Configures and monitors network security tools", "5": "Designs enterprise network security architecture"}},
    {"skill_id": "cryptography", "name": "Cryptography", "category": "Security",
     "description": "Encryption algorithms and protocols",
     "levels": {"1": "Knows symmetric/asymmetric concepts", "3": "Implements TLS, PKI, key management", "5": "Designs cryptographic systems and audits protocols"}},
    {"skill_id": "penetration_testing", "name": "Penetration Testing", "category": "Security",
     "description": "Ethical hacking and vulnerability assessment",
     "levels": {"1": "Runs basic Nmap/Metasploit scans", "3": "Conducts full pentest engagements", "5": "Leads red team operations and zero-day research"}},
    {"skill_id": "incident_response", "name": "Incident Response", "category": "Security",
     "description": "Detect, contain, and recover from security incidents",
     "levels": {"1": "Follows IR playbooks", "3": "Leads incident investigations", "5": "Designs IR programs and runbooks"}},
    {"skill_id": "malware_analysis", "name": "Malware Analysis", "category": "Security",
     "description": "Static and dynamic analysis of malicious software",
     "levels": {"1": "Uses sandbox tools", "3": "Performs static/dynamic analysis", "5": "Reverse engineers advanced malware"}},
    {"skill_id": "security_auditing", "name": "Security Auditing", "category": "Security",
     "description": "Assess systems against security standards and compliance",
     "levels": {"1": "Understands ISO 27001 basics", "3": "Conducts internal audits", "5": "Leads compliance programs (ISO, SOC2, GDPR)"}},
    {"skill_id": "siem", "name": "SIEM & Log Analysis", "category": "Security",
     "description": "Security information and event management platforms",
     "levels": {"1": "Reads SIEM dashboards", "3": "Writes detection rules and tunes alerts", "5": "Architects SIEM deployments"}},
    {"skill_id": "threat_modeling", "name": "Threat Modeling", "category": "Security",
     "description": "Identify and prioritize potential security threats",
     "levels": {"1": "Familiar with STRIDE", "3": "Conducts threat models for systems", "5": "Defines threat modeling standards org-wide"}},
    {"skill_id": "web_security", "name": "Web Application Security", "category": "Security",
     "description": "OWASP vulnerabilities and web attack/defense",
     "levels": {"1": "Knows OWASP Top 10", "3": "Finds and exploits web vulns", "5": "Designs secure web architectures"}},
    {"skill_id": "cloud_security", "name": "Cloud Security", "category": "Security",
     "description": "Securing cloud infrastructure (AWS/Azure/GCP)",
     "levels": {"1": "Understands shared responsibility model", "3": "Configures cloud IAM and security groups", "5": "Architects zero-trust cloud environments"}},

    # Programming
    {"skill_id": "python", "name": "Python", "category": "Programming",
     "description": "Python scripting and development",
     "levels": {"1": "Writes basic scripts", "3": "Builds tools and automation", "5": "Develops production systems and libraries"}},
    {"skill_id": "java", "name": "Java", "category": "Programming",
     "description": "Java application development",
     "levels": {"1": "Understands OOP basics", "3": "Builds applications with frameworks", "5": "Designs distributed Java systems"}},
    {"skill_id": "c_cpp", "name": "C/C++", "category": "Programming",
     "description": "Systems and low-level programming",
     "levels": {"1": "Writes basic programs", "3": "Manages memory, pointers, data structures", "5": "Writes OS kernels, firmware, or exploit code"}},
    {"skill_id": "javascript", "name": "JavaScript", "category": "Programming",
     "description": "Web and Node.js development",
     "levels": {"1": "Writes DOM manipulation scripts", "3": "Builds full-stack JS apps", "5": "Architects scalable JS/TS systems"}},
    {"skill_id": "sql", "name": "SQL", "category": "Programming",
     "description": "Relational database querying and design",
     "levels": {"1": "Writes SELECT queries", "3": "Designs schemas and optimizes queries", "5": "Tunes performance on large-scale databases"}},
    {"skill_id": "bash_scripting", "name": "Bash Scripting", "category": "Programming",
     "description": "Shell scripting and automation",
     "levels": {"1": "Writes simple shell scripts", "3": "Automates system administration tasks", "5": "Writes complex automation pipelines"}},
    {"skill_id": "rust", "name": "Rust", "category": "Programming",
     "description": "Systems programming with memory safety",
     "levels": {"1": "Understands ownership model", "3": "Builds CLI tools and services", "5": "Writes high-performance safe systems code"}},

    # Systems
    {"skill_id": "linux_admin", "name": "Linux Administration", "category": "Systems",
     "description": "Linux system administration and configuration",
     "levels": {"1": "Navigates CLI and file system", "3": "Manages services, users, and packages", "5": "Administers enterprise Linux infrastructure"}},
    {"skill_id": "windows_admin", "name": "Windows Administration", "category": "Systems",
     "description": "Windows Server and Active Directory",
     "levels": {"1": "Uses Windows Server GUI", "3": "Manages AD, GPO, and DNS", "5": "Architects enterprise Windows environments"}},
    {"skill_id": "networking", "name": "Computer Networking", "category": "Systems",
     "description": "TCP/IP, routing, switching, and protocols",
     "levels": {"1": "Understands OSI model and IP addressing", "3": "Configures routers, switches, and VLANs", "5": "Designs and troubleshoots complex networks"}},
    {"skill_id": "cloud_computing", "name": "Cloud Computing", "category": "Systems",
     "description": "Cloud platforms — AWS, Azure, GCP",
     "levels": {"1": "Deploys basic cloud resources", "3": "Architects multi-service cloud solutions", "5": "Leads cloud migration and cost optimization"}},
    {"skill_id": "virtualization", "name": "Virtualization", "category": "Systems",
     "description": "VMware, Hyper-V, KVM hypervisors",
     "levels": {"1": "Creates and runs VMs", "3": "Manages hypervisor clusters", "5": "Designs enterprise virtualization infrastructure"}},
    {"skill_id": "containerization", "name": "Containerization", "category": "Systems",
     "description": "Docker, Kubernetes, and container orchestration",
     "levels": {"1": "Runs Docker containers", "3": "Writes Dockerfiles and Compose stacks", "5": "Architects Kubernetes clusters in production"}},
    {"skill_id": "devops", "name": "DevOps & CI/CD", "category": "Systems",
     "description": "Continuous integration, delivery, and infrastructure as code",
     "levels": {"1": "Uses a CI pipeline", "3": "Builds and maintains CI/CD pipelines", "5": "Designs DevOps platforms and GitOps workflows"}},

    # Data
    {"skill_id": "data_analysis", "name": "Data Analysis", "category": "Data",
     "description": "Analyzing and interpreting structured data",
     "levels": {"1": "Uses Excel or pandas for basic analysis", "3": "Performs statistical analysis and EDA", "5": "Leads data-driven decision making"}},
    {"skill_id": "machine_learning", "name": "Machine Learning", "category": "Data",
     "description": "ML algorithms and model training",
     "levels": {"1": "Understands supervised/unsupervised concepts", "3": "Trains and evaluates ML models", "5": "Designs ML systems in production"}},
    {"skill_id": "databases", "name": "Database Design", "category": "Data",
     "description": "Relational and NoSQL database architecture",
     "levels": {"1": "Designs basic normalized schemas", "3": "Optimizes queries and indexes", "5": "Architects distributed database systems"}},
    {"skill_id": "data_visualization", "name": "Data Visualization", "category": "Data",
     "description": "Creating charts, dashboards, and visual reports",
     "levels": {"1": "Creates charts in Excel/Tableau", "3": "Builds interactive dashboards", "5": "Designs data storytelling systems"}},

    # Soft Skills
    {"skill_id": "technical_writing", "name": "Technical Writing", "category": "Soft Skills",
     "description": "Writing clear technical documentation",
     "levels": {"1": "Writes basic README files", "3": "Produces clear technical reports", "5": "Authors comprehensive technical documentation"}},
    {"skill_id": "presentation", "name": "Presentation Skills", "category": "Soft Skills",
     "description": "Communicating technical ideas to audiences",
     "levels": {"1": "Presents with slides", "3": "Delivers confident technical presentations", "5": "Presents to C-suite and external stakeholders"}},
    {"skill_id": "teamwork", "name": "Teamwork & Collaboration", "category": "Soft Skills",
     "description": "Working effectively in teams",
     "levels": {"1": "Participates in team projects", "3": "Leads small team sub-tasks", "5": "Coordinates cross-functional teams"}},
    {"skill_id": "project_management", "name": "Project Management", "category": "Soft Skills",
     "description": "Planning, executing, and delivering projects",
     "levels": {"1": "Uses Trello or GitHub Issues", "3": "Runs Agile sprints", "5": "Manages large multi-team projects"}},
    {"skill_id": "problem_solving", "name": "Problem Solving", "category": "Soft Skills",
     "description": "Analytical thinking and debugging",
     "levels": {"1": "Solves structured problems", "3": "Debugs complex multi-system issues", "5": "Designs solutions to ambiguous technical challenges"}},
    {"skill_id": "ethical_hacking_law", "name": "Cybersecurity Law & Ethics", "category": "Soft Skills",
     "description": "Legal and ethical aspects of cybersecurity",
     "levels": {"1": "Knows GDPR basics", "3": "Understands legal scope of security testing", "5": "Advises on legal compliance for security programs"}},
    {"skill_id": "packet_analysis", "name": "Packet & Traffic Analysis", "category": "Security",
     "description": "Analyzing network traffic with Wireshark and similar tools",
     "levels": {"1": "Captures and reads basic packets", "3": "Identifies anomalies in traffic", "5": "Reconstructs full attack chains from PCAP"}},
    {"skill_id": "firewall_config", "name": "Firewall Configuration", "category": "Security",
     "description": "Configuring and managing firewalls",
     "levels": {"1": "Understands allow/deny rules", "3": "Configures stateful firewalls and NAT", "5": "Designs NGFW and zero-trust perimeters"}},
    {"skill_id": "ids_ips", "name": "IDS/IPS Systems", "category": "Security",
     "description": "Intrusion detection and prevention systems",
     "levels": {"1": "Understands Snort/Suricata concepts", "3": "Deploys and tunes IDS/IPS rules", "5": "Architects enterprise IDS/IPS at scale"}},
    {"skill_id": "digital_forensics", "name": "Digital Forensics", "category": "Security",
     "description": "Evidence collection and forensic investigation",
     "levels": {"1": "Uses basic forensic tools", "3": "Conducts disk and memory forensics", "5": "Leads forensic investigations and expert testimony"}},
    {"skill_id": "os_internals", "name": "OS Internals", "category": "Systems",
     "description": "Operating system architecture and internals",
     "levels": {"1": "Understands processes and memory", "3": "Traces syscalls and kernel behavior", "5": "Patches kernel modules and writes drivers"}},
    {"skill_id": "algorithms", "name": "Algorithms & Data Structures", "category": "Programming",
     "description": "Fundamental CS algorithms and data structures",
     "levels": {"1": "Implements basic sorting/searching", "3": "Solves medium-complexity algorithm problems", "5": "Designs novel algorithms for complex problems"}},
]

# ---------------------------------------------------------------------------
# Courses (20+ TalTech-style)
# ---------------------------------------------------------------------------

COURSES = [
    # --- Cybersecurity Engineering (ICS) ---
    {
        "code": "ICS0001", "name": "Introduction to Cybersecurity", "ects": 6,
        "semester": "Fall",
        "description": "Foundational cybersecurity concepts: threats, vulnerabilities, defense mechanisms, and the security mindset.",
        "schedule": [
            {"day": "Monday", "start": "10:00", "end": "12:00", "type": "Lecture"},
            {"day": "Wednesday", "start": "14:00", "end": "16:00", "type": "Lab"},
        ],
        "prerequisites": [],
        "skills_taught": ["network_security", "problem_solving", "ethical_hacking_law"],
    },
    {
        "code": "ICS0014", "name": "Cryptography and Data Security", "ects": 6,
        "semester": "Spring",
        "description": "Symmetric and asymmetric encryption, hashing, PKI, TLS, and applied cryptographic protocols.",
        "schedule": [
            {"day": "Tuesday", "start": "12:00", "end": "14:00", "type": "Lecture"},
            {"day": "Thursday", "start": "10:00", "end": "12:00", "type": "Lab"},
        ],
        "prerequisites": ["ICS0001"],
        "skills_taught": ["cryptography", "python", "problem_solving"],
    },
    {
        "code": "ICS0019", "name": "Network Fundamentals", "ects": 6,
        "semester": "Fall",
        "description": "TCP/IP stack, routing protocols, switching, VLANs, and network troubleshooting.",
        "schedule": [
            {"day": "Monday", "start": "14:00", "end": "16:00", "type": "Lecture"},
            {"day": "Friday", "start": "10:00", "end": "12:00", "type": "Lab"},
        ],
        "prerequisites": [],
        "skills_taught": ["networking", "linux_admin", "packet_analysis"],
    },
    {
        "code": "ICS0026", "name": "Network Security", "ects": 6,
        "semester": "Fall",
        "description": "Network defense, firewall configuration, intrusion detection systems, and traffic analysis.",
        "schedule": [
            {"day": "Monday", "start": "10:00", "end": "12:00", "type": "Lecture"},
            {"day": "Wednesday", "start": "14:00", "end": "16:00", "type": "Lab"},
        ],
        "prerequisites": ["ICS0019"],
        "skills_taught": ["network_security", "firewall_config", "ids_ips", "packet_analysis"],
    },
    {
        "code": "ICS0031", "name": "Ethical Hacking and Penetration Testing", "ects": 6,
        "semester": "Spring",
        "description": "Methodology for ethical hacking: reconnaissance, exploitation, post-exploitation, and reporting.",
        "schedule": [
            {"day": "Tuesday", "start": "10:00", "end": "12:00", "type": "Lecture"},
            {"day": "Thursday", "start": "14:00", "end": "16:00", "type": "Lab"},
        ],
        "prerequisites": ["ICS0026"],
        "skills_taught": ["penetration_testing", "web_security", "linux_admin", "bash_scripting"],
    },
    {
        "code": "ICS0035", "name": "Malware Analysis and Reverse Engineering", "ects": 6,
        "semester": "Spring",
        "description": "Static and dynamic malware analysis, disassembly, and behavioral analysis in sandboxed environments.",
        "schedule": [
            {"day": "Wednesday", "start": "10:00", "end": "12:00", "type": "Lecture"},
            {"day": "Friday", "start": "14:00", "end": "16:00", "type": "Lab"},
        ],
        "prerequisites": ["ICS0001", "ICS0014"],
        "skills_taught": ["malware_analysis", "digital_forensics", "c_cpp", "os_internals"],
    },
    {
        "code": "ICS0040", "name": "Security Operations and Incident Response", "ects": 6,
        "semester": "Fall",
        "description": "SOC operations, SIEM platforms, log analysis, incident response workflows, and threat hunting.",
        "schedule": [
            {"day": "Tuesday", "start": "14:00", "end": "16:00", "type": "Lecture"},
            {"day": "Thursday", "start": "10:00", "end": "12:00", "type": "Lab"},
        ],
        "prerequisites": ["ICS0026"],
        "skills_taught": ["siem", "incident_response", "threat_modeling", "packet_analysis"],
    },
    {
        "code": "ICS0045", "name": "Web Application Security", "ects": 6,
        "semester": "Spring",
        "description": "OWASP Top 10, SQL injection, XSS, CSRF, secure development practices, and bug bounty methodology.",
        "schedule": [
            {"day": "Monday", "start": "12:00", "end": "14:00", "type": "Lecture"},
            {"day": "Wednesday", "start": "10:00", "end": "12:00", "type": "Lab"},
        ],
        "prerequisites": ["ICS0031"],
        "skills_taught": ["web_security", "penetration_testing", "python", "javascript"],
    },
    {
        "code": "ICS0050", "name": "Cloud Security Engineering", "ects": 6,
        "semester": "Spring",
        "description": "Securing cloud environments on AWS and Azure: IAM, security groups, zero-trust, and compliance.",
        "schedule": [
            {"day": "Thursday", "start": "12:00", "end": "14:00", "type": "Lecture"},
            {"day": "Friday", "start": "10:00", "end": "12:00", "type": "Lab"},
        ],
        "prerequisites": ["ICS0026"],
        "skills_taught": ["cloud_security", "cloud_computing", "network_security", "security_auditing"],
    },
    {
        "code": "ICS0055", "name": "Digital Forensics and Investigation", "ects": 6,
        "semester": "Fall",
        "description": "Evidence acquisition, disk and memory forensics, chain of custody, and legal aspects.",
        "schedule": [
            {"day": "Monday", "start": "16:00", "end": "18:00", "type": "Lecture"},
            {"day": "Wednesday", "start": "16:00", "end": "18:00", "type": "Lab"},
        ],
        "prerequisites": ["ICS0035"],
        "skills_taught": ["digital_forensics", "incident_response", "ethical_hacking_law", "os_internals"],
    },
    {
        "code": "ICS0060", "name": "Security Auditing and Compliance", "ects": 6,
        "semester": "Fall",
        "description": "ISO 27001, GDPR, NIS2, risk management frameworks, and conducting security audits.",
        "schedule": [
            {"day": "Tuesday", "start": "16:00", "end": "18:00", "type": "Lecture"},
            {"day": "Thursday", "start": "16:00", "end": "18:00", "type": "Seminar"},
        ],
        "prerequisites": ["ICS0001"],
        "skills_taught": ["security_auditing", "threat_modeling", "ethical_hacking_law", "technical_writing"],
    },

    # --- Computer Science (ITC) ---
    {
        "code": "ITC0001", "name": "Programming Fundamentals", "ects": 6,
        "semester": "Fall",
        "description": "Core programming concepts using Python: variables, control flow, functions, OOP basics.",
        "schedule": [
            {"day": "Monday", "start": "08:00", "end": "10:00", "type": "Lecture"},
            {"day": "Thursday", "start": "14:00", "end": "16:00", "type": "Lab"},
        ],
        "prerequisites": [],
        "skills_taught": ["python", "algorithms", "problem_solving"],
    },
    {
        "code": "ITC0015", "name": "Algorithms and Data Structures", "ects": 6,
        "semester": "Spring",
        "description": "Sorting, searching, trees, graphs, dynamic programming, and algorithm complexity analysis.",
        "schedule": [
            {"day": "Tuesday", "start": "08:00", "end": "10:00", "type": "Lecture"},
            {"day": "Friday", "start": "12:00", "end": "14:00", "type": "Lab"},
        ],
        "prerequisites": ["ITC0001"],
        "skills_taught": ["algorithms", "python", "c_cpp", "problem_solving"],
    },
    {
        "code": "ITC0028", "name": "Operating Systems", "ects": 6,
        "semester": "Fall",
        "description": "Process management, memory management, file systems, and OS kernel internals.",
        "schedule": [
            {"day": "Wednesday", "start": "12:00", "end": "14:00", "type": "Lecture"},
            {"day": "Friday", "start": "16:00", "end": "18:00", "type": "Lab"},
        ],
        "prerequisites": ["ITC0015"],
        "skills_taught": ["os_internals", "linux_admin", "c_cpp", "bash_scripting"],
    },
    {
        "code": "ITC0042", "name": "Databases", "ects": 6,
        "semester": "Spring",
        "description": "Relational database design, SQL, transactions, indexing, and introduction to NoSQL.",
        "schedule": [
            {"day": "Monday", "start": "12:00", "end": "14:00", "type": "Lecture"},
            {"day": "Wednesday", "start": "08:00", "end": "10:00", "type": "Lab"},
        ],
        "prerequisites": ["ITC0001"],
        "skills_taught": ["sql", "databases", "python", "data_analysis"],
    },
    {
        "code": "ITC0055", "name": "Software Engineering", "ects": 6,
        "semester": "Spring",
        "description": "Agile methodologies, design patterns, testing, CI/CD, and team-based software development.",
        "schedule": [
            {"day": "Tuesday", "start": "10:00", "end": "12:00", "type": "Lecture"},
            {"day": "Thursday", "start": "12:00", "end": "14:00", "type": "Lab"},
        ],
        "prerequisites": ["ITC0015"],
        "skills_taught": ["devops", "python", "javascript", "teamwork", "project_management"],
    },
    {
        "code": "ITC0068", "name": "Machine Learning Fundamentals", "ects": 6,
        "semester": "Fall",
        "description": "Supervised and unsupervised learning, model evaluation, scikit-learn, and neural network basics.",
        "schedule": [
            {"day": "Monday", "start": "14:00", "end": "16:00", "type": "Lecture"},
            {"day": "Thursday", "start": "08:00", "end": "10:00", "type": "Lab"},
        ],
        "prerequisites": ["ITC0042"],
        "skills_taught": ["machine_learning", "python", "data_analysis", "data_visualization"],
    },
    {
        "code": "ITC0075", "name": "Computer Networks", "ects": 6,
        "semester": "Fall",
        "description": "Network architecture, protocols (TCP/IP, HTTP, DNS), sockets programming, and network simulation.",
        "schedule": [
            {"day": "Tuesday", "start": "12:00", "end": "14:00", "type": "Lecture"},
            {"day": "Friday", "start": "08:00", "end": "10:00", "type": "Lab"},
        ],
        "prerequisites": ["ITC0028"],
        "skills_taught": ["networking", "linux_admin", "python", "packet_analysis"],
    },

    # --- IT Systems Administration (ICA) ---
    {
        "code": "ICA0001", "name": "Linux System Administration", "ects": 6,
        "semester": "Fall",
        "description": "Linux CLI, file systems, user management, services, and shell scripting for automation.",
        "schedule": [
            {"day": "Monday", "start": "10:00", "end": "12:00", "type": "Lecture"},
            {"day": "Wednesday", "start": "12:00", "end": "14:00", "type": "Lab"},
        ],
        "prerequisites": [],
        "skills_taught": ["linux_admin", "bash_scripting", "networking", "problem_solving"],
    },
    {
        "code": "ICA0015", "name": "Virtualization Technologies", "ects": 6,
        "semester": "Spring",
        "description": "VMware ESXi, Hyper-V, KVM, and virtual network design in enterprise environments.",
        "schedule": [
            {"day": "Tuesday", "start": "10:00", "end": "12:00", "type": "Lecture"},
            {"day": "Thursday", "start": "14:00", "end": "16:00", "type": "Lab"},
        ],
        "prerequisites": ["ICA0001"],
        "skills_taught": ["virtualization", "linux_admin", "networking", "windows_admin"],
    },
    {
        "code": "ICA0028", "name": "Cloud Infrastructure and DevOps", "ects": 6,
        "semester": "Spring",
        "description": "AWS/Azure cloud services, Terraform, Docker, Kubernetes, and CI/CD pipeline design.",
        "schedule": [
            {"day": "Wednesday", "start": "10:00", "end": "12:00", "type": "Lecture"},
            {"day": "Friday", "start": "14:00", "end": "16:00", "type": "Lab"},
        ],
        "prerequisites": ["ICA0015"],
        "skills_taught": ["cloud_computing", "containerization", "devops", "linux_admin"],
    },
    {
        "code": "ICA0035", "name": "Windows Server Administration", "ects": 6,
        "semester": "Fall",
        "description": "Active Directory, Group Policy, DNS, DHCP, and enterprise Windows Server management.",
        "schedule": [
            {"day": "Monday", "start": "16:00", "end": "18:00", "type": "Lecture"},
            {"day": "Thursday", "start": "10:00", "end": "12:00", "type": "Lab"},
        ],
        "prerequisites": [],
        "skills_taught": ["windows_admin", "networking", "project_management"],
    },
    {
        "code": "ICA0042", "name": "IT Project Management", "ects": 6,
        "semester": "Spring",
        "description": "ITIL, PRINCE2 basics, Agile project management, risk management, and stakeholder communication.",
        "schedule": [
            {"day": "Tuesday", "start": "16:00", "end": "18:00", "type": "Lecture"},
            {"day": "Thursday", "start": "16:00", "end": "18:00", "type": "Seminar"},
        ],
        "prerequisites": [],
        "skills_taught": ["project_management", "technical_writing", "presentation", "teamwork"],
    },
]

# ---------------------------------------------------------------------------
# Career Paths
# ---------------------------------------------------------------------------

CAREERS = [
    {
        "career_id": "soc_analyst",
        "title": "SOC Analyst",
        "description": "Monitors and responds to security incidents in a Security Operations Center. Entry point into cybersecurity.",
        "required_skills": {
            "network_security": 3, "siem": 3, "incident_response": 3,
            "linux_admin": 2, "python": 2, "problem_solving": 3, "packet_analysis": 2,
        },
        "avg_salary_eur": 35000,
        "demand_level": "High",
        "entry_level": True,
    },
    {
        "career_id": "penetration_tester",
        "title": "Penetration Tester",
        "description": "Conducts authorized attacks on systems to find and report vulnerabilities before malicious actors do.",
        "required_skills": {
            "penetration_testing": 4, "network_security": 3, "web_security": 3,
            "linux_admin": 3, "python": 3, "bash_scripting": 3,
            "cryptography": 2, "technical_writing": 3,
        },
        "avg_salary_eur": 55000,
        "demand_level": "High",
        "entry_level": False,
    },
    {
        "career_id": "security_engineer",
        "title": "Security Engineer",
        "description": "Designs, builds, and maintains security systems and infrastructure for an organization.",
        "required_skills": {
            "network_security": 4, "cloud_security": 3, "cryptography": 3,
            "linux_admin": 3, "python": 3, "security_auditing": 3,
            "threat_modeling": 3, "devops": 2,
        },
        "avg_salary_eur": 60000,
        "demand_level": "High",
        "entry_level": False,
    },
    {
        "career_id": "software_developer",
        "title": "Software Developer",
        "description": "Designs and builds software applications. Wide range of specializations from web to embedded systems.",
        "required_skills": {
            "python": 3, "javascript": 3, "algorithms": 3, "databases": 3,
            "sql": 2, "devops": 2, "teamwork": 3, "problem_solving": 3,
        },
        "avg_salary_eur": 45000,
        "demand_level": "Very High",
        "entry_level": True,
    },
    {
        "career_id": "devops_engineer",
        "title": "DevOps Engineer",
        "description": "Bridges development and operations — automates deployments, manages cloud infrastructure, ensures reliability.",
        "required_skills": {
            "containerization": 3, "cloud_computing": 3, "devops": 4,
            "linux_admin": 3, "bash_scripting": 3, "python": 2,
            "networking": 2, "databases": 2,
        },
        "avg_salary_eur": 55000,
        "demand_level": "Very High",
        "entry_level": False,
    },
    {
        "career_id": "data_analyst",
        "title": "Data Analyst",
        "description": "Analyzes data to extract business insights, builds dashboards, and communicates findings to stakeholders.",
        "required_skills": {
            "data_analysis": 4, "sql": 3, "python": 3, "data_visualization": 3,
            "databases": 2, "presentation": 3, "problem_solving": 3,
        },
        "avg_salary_eur": 40000,
        "demand_level": "High",
        "entry_level": True,
    },
    {
        "career_id": "it_systems_admin",
        "title": "IT Systems Administrator",
        "description": "Keeps an organization's IT infrastructure running — servers, networking, user accounts, and helpdesk.",
        "required_skills": {
            "linux_admin": 3, "windows_admin": 3, "networking": 3,
            "virtualization": 2, "bash_scripting": 2, "project_management": 2,
            "teamwork": 3,
        },
        "avg_salary_eur": 32000,
        "demand_level": "Medium",
        "entry_level": True,
    },
    {
        "career_id": "cloud_security_engineer",
        "title": "Cloud Security Engineer",
        "description": "Specializes in securing cloud-native infrastructure across AWS, Azure, or GCP environments.",
        "required_skills": {
            "cloud_security": 4, "cloud_computing": 3, "network_security": 3,
            "containerization": 3, "python": 3, "security_auditing": 3,
            "devops": 2, "linux_admin": 3,
        },
        "avg_salary_eur": 70000,
        "demand_level": "High",
        "entry_level": False,
    },
]

# ---------------------------------------------------------------------------
# Seeding function
# ---------------------------------------------------------------------------

EVENTS = [
    {
        "title": "TalTech Career Fair 2026",
        "date": datetime(2026, 5, 14, 10, 0, tzinfo=timezone.utc),
        "location": "TalTech Main Building, U06a",
        "description": "Meet 60+ employers from the IT and engineering sectors. Bring your CV and attend on-site interviews. Open to all TalTech students.",
        "tags": ["career", "networking", "IT", "engineering"],
        "source": "TalTech",
    },
    {
        "title": "Erasmus+ Info Session — Study Abroad 2026/27",
        "date": datetime(2026, 5, 7, 14, 0, tzinfo=timezone.utc),
        "location": "TalTech Student Centre, Room 101",
        "description": "Learn how to apply for Erasmus+ exchange, hear from returned students, and get advice from the International Office.",
        "tags": ["erasmus", "exchange", "international", "study abroad"],
        "source": "Erasmus",
    },
    {
        "title": "CTF Competition: Cyber Siege 2026",
        "date": datetime(2026, 5, 24, 9, 0, tzinfo=timezone.utc),
        "location": "TalTech IT Lab, ICT-407",
        "description": "48-hour capture the flag competition covering web, crypto, forensics, and pwn challenges. Open to all skill levels. Prizes for top 3 teams.",
        "tags": ["CTF", "cybersecurity", "competition", "hacking"],
        "source": "TalTech",
    },
    {
        "title": "Docker & Kubernetes Hands-On Workshop",
        "date": datetime(2026, 5, 21, 13, 0, tzinfo=timezone.utc),
        "location": "TalTech IT Lab, ICT-312",
        "description": "Practical 3-hour workshop on containerizing applications and deploying them to a local Kubernetes cluster. Bring your laptop.",
        "tags": ["DevOps", "Docker", "Kubernetes", "workshop"],
        "source": "TalTech",
    },
    {
        "title": "Erasmus Partner University Fair",
        "date": datetime(2026, 6, 4, 11, 0, tzinfo=timezone.utc),
        "location": "TalTech Student Centre, Hall A",
        "description": "Representatives from 30+ European partner universities present their programs. Perfect for planning your exchange semester.",
        "tags": ["erasmus", "universities", "exchange", "international"],
        "source": "Erasmus",
    },
    {
        "title": "TalTech Open Day — IT & Engineering",
        "date": datetime(2026, 5, 30, 10, 0, tzinfo=timezone.utc),
        "location": "TalTech Campus, Ehitajate tee 5",
        "description": "Annual open day with faculty tours, lab demos, and student project showcases. Great for networking and seeing cutting-edge research.",
        "tags": ["open day", "networking", "campus", "research"],
        "source": "TalTech",
    },
    {
        "title": "Guest Lecture: AI in Cybersecurity",
        "date": datetime(2026, 4, 29, 16, 0, tzinfo=timezone.utc),
        "location": "TalTech ICT Building, Auditorium 1",
        "description": "Industry expert from Guardtime discusses how AI and ML are reshaping threat detection and incident response in enterprise environments.",
        "tags": ["AI", "cybersecurity", "lecture", "industry"],
        "source": "Partner",
    },
    {
        "title": "Spring Hackathon: Build for Estonia",
        "date": datetime(2026, 6, 13, 9, 0, tzinfo=timezone.utc),
        "location": "Garage48 Hub, Telliskivi 60a, Tallinn",
        "description": "36-hour hackathon focused on civic tech and e-governance solutions. Teams of 2–5, mentors available. Prizes worth €5000.",
        "tags": ["hackathon", "civic tech", "e-governance", "competition"],
        "source": "Partner",
    },
    {
        "title": "Data Science & Analytics Workshop",
        "date": datetime(2026, 6, 10, 13, 0, tzinfo=timezone.utc),
        "location": "TalTech IT Lab, ICT-210",
        "description": "Hands-on session covering pandas, data visualization with Plotly, and building a simple ML pipeline. Python required.",
        "tags": ["data science", "ML", "Python", "workshop"],
        "source": "TalTech",
    },
    {
        "title": "TalTech Alumni Networking Night",
        "date": datetime(2026, 6, 25, 18, 0, tzinfo=timezone.utc),
        "location": "Fotografiska Tallinn, Telliskivi 60a",
        "description": "Evening networking event with TalTech alumni working in top tech companies. Informal setting, drinks provided. Register in advance.",
        "tags": ["networking", "alumni", "career", "social"],
        "source": "TalTech",
    },
]


def seed_database(db: Session) -> None:
    if db.query(Skill).count() == 0:
        for s in SKILLS:
            db.add(Skill(**s))
        db.commit()

    if db.query(Course).count() == 0:
        for c in COURSES:
            db.add(Course(**c))
        db.commit()

    if db.query(CareerPath).count() == 0:
        for cp in CAREERS:
            db.add(CareerPath(**cp))
        db.commit()

    if db.query(Event).count() == 0:
        for ev in EVENTS:
            db.add(Event(**ev))
        db.commit()
