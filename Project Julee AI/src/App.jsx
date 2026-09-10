import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatView from './components/ChatView';
import TerminalView from './components/TerminalView';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [isThinking, setIsThinking] = useState(false);

  const connectedIntegrations = {
    github: true,
    vercel: true
  };

  // Initial messages from Julee
  const [messages, setMessages] = useState([
    {
      sender: 'julee',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: "Hello! I'm Julee, your 24/7 AI partner powered by Gemini 3.6 Flash (Medium). I'm connected to your GitHub repository and Vercel hosting.",
      actionCard: {
        title: 'Cloud Engine Online (Gemini 3.6 Flash Medium)',
        detail: 'Connected to GitHub: NazarulxFitri/muslim-companion & Vercel target.',
        url: 'https://project-julee-ai.vercel.app'
      }
    },
    {
      sender: 'julee',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: "Feel free to talk to me about work, brainstorm ideas, give instructions, or ask me to push code and deploy updates anytime!"
    }
  ]);

  // Terminal Logs state
  const [logs, setLogs] = useState([
    { timestamp: '21:28:10', category: 'SYSTEM', message: 'Julee Cloud Engine initialized on node vps-us-east (Engine: Gemini 3.6 Flash Medium).' },
    { timestamp: '21:28:12', category: 'GIT', message: 'Authenticated with GitHub PAT for repo NazarulxFitri/muslim-companion.' },
    { timestamp: '21:28:15', category: 'VERCEL', message: 'Vercel Deployment API connected. Production domain: project-julee-ai.vercel.app.' },
    { timestamp: '21:29:01', category: 'AGENT', message: 'Listening for incoming instructions from Julee Control Dashboard.' }
  ]);

  const handleSendMessage = (text) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const lowerText = text.toLowerCase().trim();
    
    // Add User Message
    const userMsg = { sender: 'user', time: timeStr, text };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    // Simulate Agent execution & response
    setTimeout(() => {
      let replyText = '';
      let codeSnippet = null;
      let actionCard = null;
      let newLogCategory = 'AGENT';
      let newLogMsg = '';

      const taskId = `TASK-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Identity / Name questions
      if (lowerText.includes('name') || lowerText.includes('who are you') || lowerText.includes('who r u')) {
        replyText = "My name is Julee! ⚡ I'm your autonomous 24/7 AI partner built to assist you with your day-to-day routine, project development, GitHub pushes, and Vercel deployments.";
        newLogCategory = 'AGENT';
        newLogMsg = `Answered identity question from user.`;
      } 
      // 2. Deploy requests
      else if (lowerText.includes('deploy') || lowerText.includes('vercel')) {
        replyText = `Understood! I triggered a fresh build and deployed your project directly to Vercel production. All health checks passed successfully!`;
        codeSnippet = `$ git push origin main\n$ vercel --prod\n> Building project...\n> Deployment complete: https://project-julee-ai.vercel.app`;
        actionCard = {
          title: 'Vercel Production Deployment Success',
          detail: 'Project build live on production SSL.',
          url: 'https://project-julee-ai.vercel.app'
        };
        newLogCategory = 'VERCEL';
        newLogMsg = `Triggered Vercel production deployment build #${taskId}. Status: 200 OK.`;
      } 
      // 3. Git Push requests
      else if (lowerText.includes('push') || lowerText.includes('git')) {
        replyText = `Got it! I committed the latest changes and pushed them straight to your GitHub repository on branch 'main'.`;
        codeSnippet = `$ git add .\n$ git commit -m "feat: updates processed by Julee AI partner"\n$ git push origin main\nTo github.com:NazarulxFitri/muslim-companion.git\n   552b195..9dde3ab  main -> main`;
        actionCard = {
          title: 'GitHub Commit & Push Complete',
          detail: 'Commit hash pushed to branch main.',
          url: 'https://github.com/NazarulxFitri/muslim-companion'
        };
        newLogCategory = 'GIT';
        newLogMsg = `Git commit pushed to origin/main successfully.`;
      } 
      // 4. System Status / Uptime
      else if (lowerText.includes('status') || lowerText.includes('uptime') || lowerText.includes('health')) {
        replyText = `System Health Report: Julee 24/7 Cloud Runner is active and operating with 99.99% uptime on Gemini 3.6 Flash (Medium). Memory usage: 42MB. Active GitHub & Vercel integrations verified.`;
        newLogCategory = 'SYSTEM';
        newLogMsg = `Performed 24/7 cloud health check. System operating normally.`;
      } 
      // 5. Capabilities / What can you do
      else if (lowerText.includes('what can you do') || lowerText.includes('capabilities') || lowerText.includes('help')) {
        replyText = `Here's what I can do for you:\n\n1. 🚀 **Deploy to Vercel**: Automatically build and publish updates to production.\n2. 🐙 **GitHub Integration**: Push commits, manage branches, and sync your repository.\n3. ☁️ **24/7 Cloud Engine**: Keep working and executing tasks even when your laptop is turned off.\n4. 💡 **Brainstorm & Assist**: Help you with daily planning, code reviews, and work routines.`;
        newLogCategory = 'AGENT';
        newLogMsg = `Listed capabilities to user.`;
      }
      // 6. Greetings & Chit-chat
      else if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('hey') || lowerText.includes('talk') || lowerText.includes('how are you')) {
        replyText = `Hey there! 😊 I'm right here with you. What's on your mind today? Whether you want to talk, brainstorm ideas, or push code updates, I'm ready!`;
        newLogCategory = 'AGENT';
        newLogMsg = `Replied conversationally to greeting.`;
      } 
      // 7. General conversational fallback
      else {
        replyText = `I hear you! I've noted: "${text}". I'm standing by to help you with anything you need—just let me know if you want me to write code, push to GitHub, or deploy updates!`;
        newLogCategory = 'AGENT';
        newLogMsg = `Processed message: "${text}".`;
      }

      // Append terminal log
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        category: newLogCategory,
        message: newLogMsg
      }]);

      // Append Julee reply
      setMessages(prev => [...prev, {
        sender: 'julee',
        time: timeStr,
        text: replyText,
        codeSnippet,
        codeLanguage: 'bash',
        actionCard
      }]);

      setIsThinking(false);
    }, 900);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleRunDiagnostic = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [
      ...prev,
      { timestamp: timeStr, category: 'SYSTEM', message: 'Running comprehensive diagnostic check...' },
      { timestamp: timeStr, category: 'GIT', message: 'GitHub connection ping: 34ms (OK)' },
      { timestamp: timeStr, category: 'VERCEL', message: 'Vercel API ping: 22ms (OK)' },
      { timestamp: timeStr, category: 'AGENT', message: 'All systems operational. Cloud worker ready.' }
    ]);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          connectedIntegrations={connectedIntegrations}
        />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'chat' && (
            <ChatView
              messages={messages}
              onSendMessage={handleSendMessage}
              isThinking={isThinking}
            />
          )}

          {activeTab === 'terminal' && (
            <TerminalView
              logs={logs}
              onClearLogs={handleClearLogs}
              onRunDiagnostic={handleRunDiagnostic}
            />
          )}
        </main>
      </div>
    </div>
  );
}
