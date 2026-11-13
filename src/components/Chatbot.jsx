import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import './Chatbot.css';
import {
  Bot,
  X,
  Minus,
  Maximize2,
  Send,
  RotateCcw,
  Sparkles,
  FileText,
  Search,
  ExternalLink,
  Droplet,
  Truck,
  Sun,
  Trash2,
  Zap,
  Lock,
  UserCheck,
  Shield
} from 'lucide-react';

const WELCOME_TEXT = "Namaste! 👋 Welcome to GRAMITRA. How can I help you today?";

const INITIAL_SUGGESTIONS = [
  'Government Schemes',
  'Register Complaint',
  'Track Complaint',
  'Village Services',
  'Contact Panchayat'
];

export default function Chatbot({ onNavigate, onOpenTracker, onSelectComplaint }) {
  const { currentUser, isPanchayat } = useAuth();
  const { complaints, villagerComplaints } = useComplaints();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: WELCOME_TEXT,
      timestamp: new Date(),
      quickSuggestions: INITIAL_SUGGESTIONS
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      setHasUnread(false);
    } else {
      setIsOpen(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: WELCOME_TEXT,
        timestamp: new Date(),
        quickSuggestions: INITIAL_SUGGESTIONS
      }
    ]);
  };

  // Rule-based Intelligence Engine
  const generateBotResponse = (userQuery) => {
    const q = userQuery.toLowerCase().trim();

    // 0. Explicit Complaint Number Look-up (e.g. MV-2026-00001)
    const complaintMatch = userQuery.match(/\b(MV-\d{4}-\d{5})\b/i);
    if (complaintMatch) {
      const complaintNum = complaintMatch[1].toUpperCase();
      const found = complaints.find(
        (c) => c.complaint_number && c.complaint_number.toUpperCase() === complaintNum
      );

      if (!found) {
        return {
          text: `⚠️ No complaint found matching **${complaintNum}** in the village registry. Please verify the 5-digit sequence (e.g. MV-2026-00001) from your receipt or SMS notification.`,
          actions: [
            {
              label: 'Open Quick Tracker',
              icon: <Search className="w-3.5 h-3.5" />,
              onClick: () => onOpenTracker && onOpenTracker()
            }
          ],
          quickSuggestions: ['Track Complaint', 'Register Complaint']
        };
      }

      const isOwner =
        currentUser &&
        (found.reporter_id === currentUser.id ||
          found.reporter_mobile_snapshot === currentUser.mobile_number);

      if (isPanchayat || isOwner) {
        return {
          text: `Here are the authentic details for complaint **${found.complaint_number}** retrieved securely from the Gram Panchayat registry:`,
          complaintData: found,
          actions: [
            {
              label: 'View Full Audit Trail',
              icon: <ExternalLink className="w-3.5 h-3.5" />,
              onClick: () => onSelectComplaint && onSelectComplaint(found.id)
            }
          ],
          quickSuggestions: ['How to check complaint status?', 'What does In Progress mean?']
        };
      } else if (!currentUser) {
        return {
          text: `🔒 Complaint **${complaintNum}** exists in the registry, but you are not logged in. For security and privacy, full grievance details are restricted to the registered complainant. Please log in or use the Quick Tracker.`,
          actions: [
            {
              label: 'Villager Login (OTP)',
              icon: <Lock className="w-3.5 h-3.5" />,
              onClick: () => onNavigate && onNavigate('villager_auth')
            },
            {
              label: 'Open Quick Tracker',
              icon: <Search className="w-3.5 h-3.5" />,
              onClick: () => onOpenTracker && onOpenTracker()
            }
          ],
          quickSuggestions: ['How to log in?', 'Track Complaint']
        };
      } else {
        return {
          text: `🔒 **Privacy Notice**: Complaint **${complaintNum}** was submitted by another resident. To protect citizen privacy, private descriptions and contact details are restricted and not revealed. You may only view complaints filed under your account.`,
          actions: [
            {
              label: 'View My Complaints',
              icon: <FileText className="w-3.5 h-3.5" />,
              onClick: () => onNavigate && onNavigate('villager_dashboard')
            },
            {
              label: 'Open Quick Tracker',
              icon: <Search className="w-3.5 h-3.5" />,
              onClick: () => onOpenTracker && onOpenTracker()
            }
          ],
          quickSuggestions: ['Track Complaint', 'Register Complaint']
        };
      }
    }

    // 1. My Complaints
    if (
      q.includes('my complaint') ||
      q.includes('my complaints') ||
      q.includes('my tickets') ||
      q.includes('my grievances') ||
      q.includes('my issues')
    ) {
      if (!currentUser) {
        return {
          text: `🔒 To securely view your personal complaints, please log in with your 10-digit mobile number and OTP. You can also track individual tickets using your Complaint Number in the Quick Tracker.`,
          actions: [
            {
              label: 'Sign In as Villager',
              icon: <Lock className="w-3.5 h-3.5" />,
              onClick: () => onNavigate && onNavigate('villager_auth')
            },
            {
              label: 'Open Quick Tracker',
              icon: <Search className="w-3.5 h-3.5" />,
              onClick: () => onOpenTracker && onOpenTracker()
            }
          ],
          quickSuggestions: ['How to log in?', 'How to check complaint status?']
        };
      }

      const userList = villagerComplaints || [];
      if (userList.length === 0) {
        return {
          text: `Namaste ${currentUser.full_name || 'Citizen'}! You currently do not have any registered complaints on record for ${currentUser.village_name || 'Kandavara'}. If you are facing any village issues, you can file a new grievance easily!`,
          actions: [
            {
              label: 'Report a Problem Now',
              icon: <FileText className="w-3.5 h-3.5" />,
              onClick: () => onNavigate && onNavigate('report_problem')
            }
          ],
          quickSuggestions: ['How to register a complaint?', 'Village Services']
        };
      }

      return {
        text: `Namaste ${currentUser.full_name}! Here are your most recent complaints on file with the Gram Panchayat:`,
        complaintsList: userList.slice(0, 3),
        actions: [
          {
            label: 'Open Citizen Dashboard',
            icon: <ExternalLink className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('villager_dashboard')
          }
        ],
        quickSuggestions: ['What does In Progress mean?', 'What does Pending mean?']
      };
    }

    // A.1: Photo upload
    if (
      q.includes('upload photo') ||
      q.includes('upload picture') ||
      q.includes('complaint photo') ||
      q.includes('take photo') ||
      q.includes('how to upload a complaint photo') ||
      q.includes('camera') ||
      q.includes('upload an image') ||
      q.includes('photo upload')
    ) {
      return {
        text: `📸 **How to Upload a Complaint Photo**:\n\n1. On the **Report a Problem** page (Step 1), click or tap the **"Upload Problem Photograph"** area.\n2. Choose a file from your device gallery, or tap your mobile camera to take a live photo of the site.\n3. Accepted formats: **JPG, PNG, WebP** (up to 10MB).\n4. Our AI Vision system will automatically verify photo clarity and assist with problem category detection!\n\n*Tip: Photos with clear lighting and identifiable landmarks help Panchayat field workers find and fix the issue faster.*`,
        actions: [
          {
            label: 'Go to Report a Problem',
            icon: <FileText className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('report_problem')
          }
        ],
        quickSuggestions: ['How to select a complaint category?', 'How to submit a complaint?']
      };
    }

    // A.2: Category selection
    if (
      q.includes('select category') ||
      q.includes('choose category') ||
      q.includes('which category') ||
      q.includes('complaint category') ||
      q.includes('how to select a complaint category') ||
      q.includes('categories')
    ) {
      return {
        text: `📂 **How to Select a Complaint Category**:\n\nIn Step 2 of reporting, pick from the 10 official Gram Panchayat civic categories:\n• 🚰 **Water Supply**: Pipeline leaks, contaminated drinking water, dry borewells.\n• ⚡ **Electrical Problems**: Live dangling wires, transformer sparks, power hazards.\n• 🚚 **Roads and Transportation**: Potholes, broken asphalt, blocked lanes.\n• 🗑️ **Waste Management & Sanitation**: Garbage heaps, uncollected bins, stench.\n• ☀️ **Streetlights & Public Lighting**: Dead bulbs, dark intersections.\n• 🏛️ **Public Property Damage**: Damaged Panchayat Bhavan, broken benches.\n• 🌊 **Drainage and Sewage**: Clogged nullahs, overflow.\n• 🐕 **Animal-Related Issues**: Stray animal threats.\n• ❓ **Other**: Any issue not listed above.\n\n*If you are unsure, select the closest category or 'Other' — Panchayat officials can adjust it during review.*`,
        actions: [
          {
            label: 'Report a Problem',
            icon: <FileText className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('report_problem')
          }
        ],
        quickSuggestions: ['How to upload a complaint photo?', 'How to submit a complaint?']
      };
    }

    // A.3: Submitting complaint
    if (
      q.includes('how to submit') ||
      q.includes('submit complaint') ||
      q.includes('how to submit a complaint') ||
      q.includes('final step') ||
      q.includes('finish complaint')
    ) {
      return {
        text: `🚀 **How to Submit a Complaint**:\n\n1. **Step 1**: Upload a clear photograph (optional but recommended).\n2. **Step 2**: Choose the appropriate Civic Category.\n3. **Step 3**: Enter a concise Title, Description, Ward number, and share your GPS location if possible.\n4. **Step 4 (Review)**: Review the AI safety priority assessment and precautionary safety advice.\n5. **Click 'Submit Complaint'**: You will instantly receive a unique Complaint Number (e.g. **MV-2026-00001**) and an SMS confirmation!`,
        actions: [
          {
            label: 'Start New Complaint',
            icon: <FileText className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('report_problem')
          }
        ],
        quickSuggestions: ['How to check complaint status?', 'What does Pending mean?']
      };
    }

    // A.4: Register complaint (General)
    if (
      q.includes('how to register a complaint') ||
      q.includes('register complaint') ||
      q.includes('file complaint') ||
      q.includes('lodge complaint') ||
      q.includes('raise complaint') ||
      q.includes('report problem') ||
      q.includes('report an issue') ||
      q.includes('create complaint') ||
      q.includes('complaint registration') ||
      q === 'register complaint'
    ) {
      return {
        text: `📝 **How to Register a Complaint on Modern Village**:\n\nRegistering a village grievance takes less than 2 minutes:\n1. Click **"Report a Problem"** in the top navigation bar or from your dashboard.\n2. **Upload a Photo**: Take or upload a photo of the problem.\n3. **Select Category**: Pick Water, Roads, Electricity, Streetlights, or Sanitation.\n4. **Describe the Issue**: Provide details of the problem and specify your ward/landmark.\n5. **Review & Submit**: Verify your report and click **Submit**. You will receive an official tracking number (e.g., MV-2026-XXXXX) and SMS updates as work progresses!`,
        actions: [
          {
            label: 'Report a Problem Now',
            icon: <FileText className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('report_problem')
          }
        ],
        quickSuggestions: [
          'How to upload a complaint photo?',
          'How to select a complaint category?',
          'How to check complaint status?'
        ]
      };
    }

    // B.1: Pending
    if (
      q.includes('pending') ||
      q.includes('what does pending mean') ||
      q.includes('pending status')
    ) {
      return {
        text: `⏳ **What does PENDING mean?**\n\n• **Status**: Step 1 of 4 (Queued for Inspection)\n• **Meaning**: Your complaint has been successfully recorded in the Gram Panchayat central registry. It has passed AI triage and is awaiting review by the Panchayat Secretary or Junior Engineer for work order assignment.\n• **Expected Action**: The official will review the description, assess emergency priority, and acknowledge the grievance within 24 hours.`,
        quickSuggestions: ['What does In Progress mean?', 'What does Resolved mean?', 'Track Complaint']
      };
    }

    // B.2: In Progress
    if (
      q.includes('in progress') ||
      q.includes('what does in progress mean') ||
      q.includes('in progress status') ||
      q.includes('progress')
    ) {
      return {
        text: `🛠️ **What does IN PROGRESS mean?**\n\n• **Status**: Step 3 of 4 (Active Field Work)\n• **Meaning**: The Gram Panchayat has dispatched a maintenance crew, line technician, or sanitation team to the location. Repair work, pipeline welding, road filling, or electrical fixing is actively happening on site!\n• **Expected Action**: Once the work crew completes the repair, the supervisor conducts a quality check and marks the ticket Resolved with completion notes.`,
        quickSuggestions: ['What does Resolved mean?', 'What does Pending mean?', 'Track Complaint']
      };
    }

    // B.3: Resolved
    if (
      q.includes('resolved') ||
      q.includes('completed') ||
      q.includes('what does resolved mean') ||
      q.includes('what does completed mean') ||
      q.includes('resolved meaning')
    ) {
      return {
        text: `✅ **What does RESOLVED (Completed) mean?**\n\n• **Status**: Step 4 of 4 (Finished & Verified)\n• **Meaning**: The reported village problem has been successfully fixed! The Gram Panchayat official has inspected the site, verified the work, and closed the complaint with an official completion remark.\n• **Your Rights**: If you feel the problem was not adequately solved, you can request reopening of the ticket through your Citizen Dashboard or by contacting the Panchayat office.`,
        quickSuggestions: ['How to check complaint status?', 'Register Complaint']
      };
    }

    // B.4: Acknowledged
    if (
      q.includes('acknowledged') ||
      q.includes('what does acknowledged mean') ||
      q.includes('acknowledgement')
    ) {
      return {
        text: `📋 **What does ACKNOWLEDGED mean?**\n\n• **Status**: Step 2 of 4 (Official Review Complete)\n• **Meaning**: An official has verified your complaint, confirmed jurisdiction, and scheduled resources. Work crew dispatch has been authorized and field execution will begin shortly.`,
        quickSuggestions: ['What does In Progress mean?', 'Track Complaint']
      };
    }

    // B.5: Track status
    if (
      q.includes('how to check complaint status') ||
      q.includes('check complaint status') ||
      q.includes('how to check status') ||
      q.includes('check status') ||
      q.includes('track complaint') ||
      q.includes('track ticket') ||
      q.includes('track') ||
      q === 'track complaint'
    ) {
      return {
        text: `🔍 **How to Check Complaint Status**:\n\n1. **Quick Tracker**: Click **"Track Ticket"** in the top navigation bar or use the button below. Enter your Complaint Number (e.g. **MV-2026-00001**) to see live progress without logging in.\n2. **Citizen Dashboard**: If you are logged in, visit **"Citizen Dashboard"** to see all your submitted complaints, real-time stage badges, and official notes.\n3. **Direct in Chat**: You can also type your complaint number directly in this chat!`,
        actions: [
          {
            label: 'Open Quick Tracker',
            icon: <Search className="w-3.5 h-3.5" />,
            onClick: () => onOpenTracker && onOpenTracker()
          },
          ...(currentUser
            ? [
                {
                  label: 'My Citizen Dashboard',
                  icon: <ExternalLink className="w-3.5 h-3.5" />,
                  onClick: () => onNavigate && onNavigate('villager_dashboard')
                }
              ]
            : [])
        ],
        quickSuggestions: [
          'What does Pending mean?',
          'What does In Progress mean?',
          'What does Resolved mean?'
        ]
      };
    }

    // C.1: Water
    if (
      q.includes('water') ||
      q.includes('pipeline') ||
      q.includes('leak') ||
      q.includes('drinking water') ||
      q.includes('borewell') ||
      q.includes('water shortage') ||
      q.includes('jal jeevan') ||
      q.includes('how to report water problems')
    ) {
      return {
        text: `🚰 **How to Report Water Supply Problems**:\n\n• **Common Issues**: Fractured distribution pipes, muddy/brown water, dry community borewells, or broken public handpumps.\n• **How to Report**: Go to **Report a Problem** and choose the **Water Supply** category. Mention the location (e.g. "Beside Community Well #2, Ward 1").\n• **Precaution**: If water is discolored or contaminated, boil all drinking water for at least 3 minutes before household use.\n• 📞 **Jal Jeevan National Helpline**: Call **1916** for urgent drinking water supply emergencies.`,
        actions: [
          {
            label: 'Report Water Issue',
            icon: <Droplet className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('report_problem')
          }
        ],
        quickSuggestions: ['How to report road damage?', 'How to report streetlight problems?']
      };
    }

    // C.2: Roads
    if (
      q.includes('road') ||
      q.includes('pothole') ||
      q.includes('road damage') ||
      q.includes('damaged road') ||
      q.includes('broken road') ||
      q.includes('asphalt') ||
      q.includes('how to report road damage')
    ) {
      return {
        text: `🚚 **How to Report Road & Transportation Damage**:\n\n• **Common Issues**: Potholes after monsoons, collapsed culverts, gravel erosion, or blocked pathways.\n• **How to Report**: Select **Roads and Transportation** on the **Report a Problem** page.\n• **Tip**: Upload a photo showing the road width and landmark. This helps the Panchayat engineering wing accurately calculate required asphalt and stone aggregate for repairs.`,
        actions: [
          {
            label: 'Report Road Damage',
            icon: <Truck className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('report_problem')
          }
        ],
        quickSuggestions: ['How to report streetlight problems?', 'How to report water problems?']
      };
    }

    // C.3: Streetlights
    if (
      q.includes('streetlight') ||
      q.includes('street light') ||
      q.includes('lighting') ||
      q.includes('dark road') ||
      q.includes('lamp') ||
      q.includes('bulb') ||
      q.includes('how to report streetlight problems')
    ) {
      return {
        text: `☀️ **How to Report Streetlight Problems**:\n\n• **Common Issues**: Non-working luminaires, broken solar poles, flickering lights, or dark hazardous intersections.\n• **How to Report**: Select **Streetlights and Public Lighting** under **Report a Problem**.\n• **Important Details**: Note the pole number (if stenciled) or nearest intersection (e.g., "Market Crossing, Ward 4").\n• *Routine streetlight bulb replacements are typically resolved by the village electrician within 48 hours.*`,
        actions: [
          {
            label: 'Report Streetlight Issue',
            icon: <Sun className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('report_problem')
          }
        ],
        quickSuggestions: ['How to report electricity problems?', 'Village Services']
      };
    }

    // C.4: Waste & sanitation
    if (
      q.includes('waste') ||
      q.includes('garbage') ||
      q.includes('sanitation') ||
      q.includes('trash') ||
      q.includes('drain') ||
      q.includes('drainage') ||
      q.includes('sewage') ||
      q.includes('smell') ||
      q.includes('odor') ||
      q.includes('how to report waste and sanitation issues')
    ) {
      return {
        text: `🗑️ **How to Report Waste and Sanitation Issues**:\n\n• **Common Issues**: Overflowing community compost bins, garbage piles on road margins, or clogged drainage nullahs spreading foul odor.\n• **How to Report**: Select **Waste Management and Sanitation** or **Drainage and Sewage**.\n• **Health Precaution**: Keep children away from accumulated waste mounds. Panchayat sanitation workers are dispatched with collection carts to transport waste to the bio-methanation facility.`,
        actions: [
          {
            label: 'Report Sanitation Issue',
            icon: <Trash2 className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('report_problem')
          }
        ],
        quickSuggestions: ['How to report water problems?', 'Village Services']
      };
    }

    // C.5: Electricity
    if (
      q.includes('electricity') ||
      q.includes('electric') ||
      q.includes('power') ||
      q.includes('hanging wire') ||
      q.includes('snapped wire') ||
      q.includes('transformer') ||
      q.includes('spark') ||
      q.includes('shock') ||
      q.includes('voltage') ||
      q.includes('how to report electricity problems')
    ) {
      return {
        text: `⚡ **How to Report Electricity Problems**:\n\n• **Common Issues**: Snapped overhead wires, smoking transformers, broken power poles, or frequent power surges.\n• **How to Report**: Select **Electrical Problems** under **Report a Problem**.\n• ⚠️ **CRITICAL PUBLIC SAFETY WARNING**: Never touch or approach snapped wires! Maintain at least 15 feet distance. Keep cattle and children away.\n• 📞 **24/7 Power Emergency Helpline**: Call **1912** or Police/Disaster at **112** for live life-safety hazards.`,
        actions: [
          {
            label: 'Report Electrical Hazard',
            icon: <Zap className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('report_problem')
          }
        ],
        quickSuggestions: ['Contact Panchayat', 'Village Services']
      };
    }

    // C.6: Village services overview
    if (
      q.includes('village services') ||
      q.includes('services') ||
      q.includes('what services') ||
      q === 'village services'
    ) {
      return {
        text: `🏡 **Gram Panchayat Village Services Available**:\n\nModern Village supports grievance lodging and resolution tracking for all primary rural public services:\n\n1. 🚰 **Water Supply**: Leaks, handpump repair, safe drinking water.\n2. 🚚 **Roads & Transport**: Pothole filling, gravel roads, blocked paths.\n3. ☀️ **Streetlights**: Public road illumination, solar lighting.\n4. 🗑️ **Waste & Sanitation**: Garbage collection, drainage desilting.\n5. ⚡ **Electrical Safety**: Power line faults, hazard elimination.\n\nClick any topic below for detailed guidance on how to report!`,
        quickSuggestions: [
          'How to report water problems?',
          'How to report road damage?',
          'How to report streetlight problems?',
          'How to report waste and sanitation issues?',
          'How to report electricity problems?'
        ]
      };
    }

    // D.1: Register as a villager
    if (
      q.includes('how to register as a villager') ||
      q.includes('register as a villager') ||
      q.includes('register as villager') ||
      q.includes('register villager') ||
      q.includes('sign up') ||
      q.includes('signup') ||
      q.includes('create account') ||
      q.includes('new villager')
    ) {
      return {
        text: `📱 **How to Register as a Villager**:\n\n1. Click **"Villager Login"** in the top navigation bar.\n2. Enter your **10-digit Indian mobile number** (e.g. 9876543210).\n3. Tap **"Send Verification Code"** to receive a 6-digit SMS OTP.\n4. Enter the verification code along with your Full Name and Ward.\n5. Your citizen profile will be registered instantly! You do not need to memorize any complex passwords.`,
        actions: [
          {
            label: 'Citizen Registration Page',
            icon: <UserCheck className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('villager_auth')
          }
        ],
        quickSuggestions: ['How to log in?', 'How to register a complaint?']
      };
    }

    // D.2: Login help
    if (
      q.includes('how to log in') ||
      q.includes('how to login') ||
      q.includes('login') ||
      q.includes('log in') ||
      q.includes('sign in') ||
      q.includes('login help') ||
      q === 'login help'
    ) {
      return {
        text: `🔑 **How to Log In to Modern Village**:\n\n• **For Villagers**: Click **"Villager Login"** at the top right. Enter your 10-digit mobile number, receive a 6-digit OTP via SMS, and enter it to access your Citizen Dashboard.\n• **For Panchayat Officials**: Click **"Panchayat Official"** at the top. Enter your government email (\`official@panchayat.gov.in\`) and password to manage grievances and reports.\n• *Demo Mode*: Pre-seeded villager profiles (Rameshwar, Sunita, Anil) are also available on the login page for testing.`,
        actions: [
          {
            label: 'Villager Login',
            icon: <UserCheck className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('villager_auth')
          },
          {
            label: 'Panchayat Official Portal',
            icon: <Shield className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('panchayat_login')
          }
        ],
        quickSuggestions: ['How to register as a villager?', 'How to register a complaint?']
      };
    }

    // D.3: Contact Panchayat
    if (
      q.includes('how to contact panchayat officials') ||
      q.includes('how to contact panchayat') ||
      q.includes('contact panchayat') ||
      q.includes('panchayat office') ||
      q.includes('secretary') ||
      q.includes('sarpanch') ||
      q.includes('helpline') ||
      q.includes('phone number') ||
      q === 'contact panchayat'
    ) {
      return {
        text: `🏛️ **How to Contact Gram Panchayat Officials**:\n\n• **Physical Office**: Kandavara Gram Panchayat Bhavan, Main Village Center.\n• **Office Hours**: Monday to Saturday, 10:00 AM – 5:00 PM (Closed Sundays & Government Holidays).\n• **Panchayat Secretary**: Satish Sharma (Office Desk)\n• **Junior Engineer**: R. Verma (Field Engineering)\n• 📞 **Toll-Free Civic Helpline**: **1800-180-1551**\n• 🚨 **Emergency Helplines**: Police/All Emergency: **112** | Electricity: **1912** | Water: **1916**\n\n*Tip: Registering your grievance on this platform gives you an official tracking receipt with documented audit trails!*`,
        quickSuggestions: ['Register Complaint', 'Track Complaint', 'Village Services']
      };
    }

    // D.4: Purpose
    if (
      q.includes('what is the purpose of modern village') ||
      q.includes('purpose of modern village') ||
      q.includes('what is modern village') ||
      q.includes('purpose') ||
      q.includes('about modern village') ||
      q.includes('mission') ||
      q.includes('vision')
    ) {
      return {
        text: `🌟 **Purpose of Modern Village**:\n\n**"Your Village. Your Voice. Our Responsibility."**\n\nModern Village is an AI-assisted rural civic governance platform designed to empower citizens and Gram Panchayat authorities:\n1. **Direct Citizen Voice**: Report village issues directly without bureaucratic intermediaries.\n2. **AI Safety Triage**: Automatically triage urgent hazards (like fallen high-voltage wires) within seconds for priority dispatch.\n3. **Full Transparency**: Track complaint resolution through immutable audit logs and photo verification.\n4. **Welfare Access**: Explore verified Central and State Government Schemes (PM-KISAN, Ayushman Bharat, Gruha Lakshmi, etc.).`,
        actions: [
          {
            label: 'Explore Government Schemes',
            icon: <ExternalLink className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('government_schemes')
          }
        ],
        quickSuggestions: ['Register Complaint', 'Village Services', 'Contact Panchayat']
      };
    }

    // E: Government Schemes
    if (
      q.includes('scheme') ||
      q.includes('schemes') ||
      q.includes('government scheme') ||
      q.includes('pm kisan') ||
      q.includes('yojana') ||
      q.includes('benefit')
    ) {
      return {
        text: `🏛️ **Government Schemes & Benefits**:\n\nModern Village provides verified information on major Central and Karnataka State Government Schemes, including PM-KISAN, Gruha Lakshmi, Yuva Nidhi, Ayushman Bharat, and PM Awas Yojana.\n\nYou can search schemes by category, verify eligibility rules, check required documents, and access direct official government application portals!`,
        actions: [
          {
            label: 'View Government Schemes',
            icon: <ExternalLink className="w-3.5 h-3.5" />,
            onClick: () => onNavigate && onNavigate('government_schemes')
          }
        ],
        quickSuggestions: ['Register Complaint', 'Village Services', 'Contact Panchayat']
      };
    }

    // F: Greetings
    if (
      q === 'hi' ||
      q === 'hello' ||
      q === 'hey' ||
      q === 'namaste' ||
      q === 'namaskara' ||
      q.includes('good morning') ||
      q.includes('good afternoon') ||
      q.includes('good evening') ||
      q === 'help'
    ) {
      return {
        text: `Namaste! 🙏 I am here to help you navigate Modern Village. You can ask me anything about lodging complaints, checking grievance progress, village public services, or contacting Panchayat officials. How may I assist you today?`,
        quickSuggestions: INITIAL_SUGGESTIONS
      };
    }

    if (q.includes('thank') || q.includes('thanks') || q.includes('dhanyavad')) {
      return {
        text: `You're very welcome! 🙏 Always here to serve our village. Let me know if you need any other assistance.`,
        quickSuggestions: ['Register Complaint', 'Track Complaint', 'Village Services']
      };
    }

    // Fallback
    return {
      text: "Sorry, I couldn't understand your question. Please try asking about complaints, tracking, or village services.",
      quickSuggestions: INITIAL_SUGGESTIONS
    };
  };

  const handleSendMessage = (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateBotResponse(text);

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse.text,
        actions: botResponse.actions,
        quickSuggestions: botResponse.quickSuggestions,
        complaintData: botResponse.complaintData,
        complaintsList: botResponse.complaintsList,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      if (!isOpen) {
        setHasUnread(true);
      }
    }, 450);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* 1. Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-3">
          <div
            onClick={toggleChat}
            className="hidden sm:flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/90 text-xs font-semibold text-slate-700 cursor-pointer hover:border-emerald-500 hover:text-emerald-700 transition transform hover:-translate-y-0.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Need Help? GRAMITRA</span>
          </div>

          <button
            onClick={toggleChat}
            aria-label="Open GRAMITRA Chatbot"
            className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white shadow-2xl flex items-center justify-center cursor-pointer transition transform hover:scale-105 active:scale-95 border-2 border-white focus:outline-none focus:ring-4 focus:ring-emerald-300/50 chatbot-pulse-button"
          >
            <Bot className="w-7 h-7" />

            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </span>
            )}
          </button>
        </div>
      )}

      {/* 2. Minimized Bar */}
      {isOpen && isMinimized && (
        <div
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 cursor-pointer hover:shadow-emerald-900/20 transition transform hover:-translate-y-0.5"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold leading-none">GRAMITRA</p>
            <p className="text-[10px] text-emerald-200 mt-0.5">Click to expand chat window</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            title="Maximize"
            className="p-1 hover:bg-white/10 rounded-lg text-emerald-100 transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            title="Close"
            className="p-1 hover:bg-white/10 rounded-lg text-emerald-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Full Chatbot Window */}
      {isOpen && !isMinimized && (
        <div
          role="dialog"
          aria-label="GRAMITRA Chatbot Window"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[400px] h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-chatbot-window font-sans"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white px-4 py-3.5 flex items-center justify-between border-b border-emerald-600/30">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 text-white shadow-inner">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-800 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight text-white">
                    GRAMITRA
                  </h3>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 px-1.5 py-0.2 rounded-full font-semibold">
                    Civic Desk
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 font-medium">
                  {currentUser ? `Serving ${currentUser.full_name}` : 'Kandavara Gram Panchayat • 24/7'}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart Chat"
                className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/15 rounded-xl transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                title="Minimize"
                className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/15 rounded-xl transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/15 rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 chatbot-messages-scroll">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 animate-message-in ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Bot Avatar */}
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line space-y-1">
                    {msg.text.split('\n').map((line, idx) => {
                      if (!line.trim()) return <div key={idx} className="h-1.5" />;
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={idx} className="leading-relaxed">
                          {parts.map((part, pIdx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return (
                                <strong
                                  key={pIdx}
                                  className={msg.sender === 'user' ? 'font-bold' : 'font-bold text-slate-900'}
                                >
                                  {part.slice(2, -2)}
                                </strong>
                              );
                            }
                            return part;
                          })}
                        </p>
                      );
                    })}
                  </div>

                  {/* Single Complaint Card */}
                  {msg.complaintData && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {msg.complaintData.complaint_number}
                        </span>
                        <StatusBadge status={msg.complaintData.status} />
                      </div>
                      <p className="font-semibold text-slate-900 text-xs line-clamp-2">
                        {msg.complaintData.title}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                        <span>{msg.complaintData.category}</span>
                        <PriorityBadge priority={msg.complaintData.priority} />
                      </div>
                    </div>
                  )}

                  {/* List of User's Recent Complaints */}
                  {msg.complaintsList && (
                    <div className="mt-2.5 space-y-2">
                      {msg.complaintsList.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => onSelectComplaint && onSelectComplaint(c.id)}
                          className="p-2.5 bg-slate-50 hover:bg-emerald-50/60 rounded-xl border border-slate-200 hover:border-emerald-300 transition cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-mono font-bold text-slate-800">{c.complaint_number}</span>
                            <StatusBadge status={c.status} />
                          </div>
                          <p className="text-xs font-semibold text-slate-900 line-clamp-1">{c.title}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Direct Actions */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap gap-2">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={act.onClick}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                        >
                          {act.icon}
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick Suggestion Chips */}
                  {msg.quickSuggestions && msg.quickSuggestions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200/70">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Suggested Questions:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.quickSuggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSendMessage(sug)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100/70 text-slate-700 hover:text-emerald-800 rounded-lg text-[11px] font-medium transition border border-slate-200 hover:border-emerald-300 text-left"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`text-[9px] mt-1.5 text-right ${
                      msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2.5 animate-message-in">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center text-xs shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="text-[11px] text-slate-400 ml-1 font-medium">
                    GRAMITRA is typing...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about complaints, tracking, services..."
                className="flex-1 px-3.5 py-2.5 bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                title="Send Message"
                className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition shadow-md flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
              <span>Press <strong>Enter</strong> to send</span>
              <span className="text-emerald-700 font-semibold">GRAMITRA</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
