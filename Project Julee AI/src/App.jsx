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
      text: "Hello! I'm Julee, your 24/7 AI partner powered by Gemini 3.6 Flash (Medium). I'm trained with your custom deployment pipeline rules.",
      actionCard: {
        title: 'Cloud Engine Online (Strict Pipeline Mode)',
        detail: 'Pipeline: npm run build ➔ lint check ➔ git add & commit ➔ git push ➔ Vercel deploy',
        url: 'https://project-julee-ai.vercel.app'
      }
    },
    {
      sender: 'julee',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: "I won't push automatically until you instruct me to 'deploy' or 'push'. When you do, I'll execute the full build ➔ lint ➔ add ➔ commit ➔ push pipeline!"
    }
  ]);

  // Terminal Logs state
  const [logs, setLogs] = useState([
    { timestamp: '21:28:10', category: 'SYSTEM', message: 'Julee Cloud Engine initialized on node vps-us-east (Engine: Gemini 3.6 Flash Medium).' },
    { timestamp: '21:28:12', category: 'GIT', message: 'Authenticated with GitHub PAT for repo NazarulxFitri/muslim-companion.' },
    { timestamp: '21:28:15', category: 'VERCEL', message: 'Vercel Deployment API connected. Production domain: project-julee-ai.vercel.app.' },
    { timestamp: '21:29:01', category: 'AGENT', message: 'Strict Deployment Pipeline rules loaded (Build ➔ Lint ➔ Add ➔ Commit ➔ Push).' }
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

      // 1. Deployment / Push Pipeline Request
      if (lowerText.includes('deploy') || lowerText.includes('push') || lowerText.includes('vercel')) {
        replyText = `Deployment Pipeline Executed Successfully!\n\n1. ✅ **Build Check**: Ran \`npm run build\` — 0 errors.\n2. ✅ **Lint Check**: Code linting & structure verified.\n3. ✅ **Stage Changes**: Executed \`git add .\`\n4. ✅ **Git Commit**: Created signed commit.\n5. ✅ **Git Push**: Pushed to \`origin/main\` on GitHub.\n6. 🚀 **Vercel Auto-Deploy**: Live on production SSL!`;
        codeSnippet = `$ npm run build (OK)\n$ npm run lint (OK)\n$ git add .\n$ git commit -m "feat: deployment pipeline executed by Julee"\n$ git push origin main\n> Vercel build triggered: https://project-julee-ai.vercel.app`;
        actionCard = {
          title: 'Full Pipeline & Vercel Deployment Complete',
          detail: 'Passed: Build ➔ Lint ➔ Add ➔ Commit ➔ Push ➔ Vercel Live',
          url: 'https://project-julee-ai.vercel.app'
        };
        newLogCategory = 'VERCEL';
        newLogMsg = `Executed full pipeline #${taskId}: build ➔ lint ➔ git add ➔ git commit ➔ git push ➔ Vercel deploy. Status: 200 OK.`;
      } 
      // 2. Identity / Name questions
      else if (lowerText.includes('name') || lowerText.includes('who are you') || lowerText.includes('who r u')) {
        replyText = "My name is Julee! ⚡ I'm your autonomous 24/7 AI partner built to assist you with your day-to-day routine, project development, and strict deployment pipelines.";
        newLogCategory = 'AGENT';
        newLogMsg = `Answered identity question.`;
      } 
      // 3. System Status / Uptime
      else if (lowerText.includes('status') || lowerText.includes('uptime') || lowerText.includes('health')) {
        replyText = `System Health Report: Julee 24/7 Cloud Runner is active and operating with 99.99% uptime on Gemini 3.6 Flash (Medium). Memory usage: 42MB. Strict Pipeline Mode enabled.`;
        newLogCategory = 'SYSTEM';
        newLogMsg = `Performed 24/7 cloud health check. System operating normally.`;
      } 
      // 4. Capabilities / What can you do
      else if (lowerText.includes('what can you do') || lowerText.includes('capabilities') || lowerText.includes('help')) {
        replyText = `Here's how I work under your rules:\n\n1. 🛑 **No Automatic Pushes**: I keep edits local until you instruct me to deploy.\n2. ⚡ **Strict Deploy Pipeline**: When you say 'deploy', I run: \`build\` ➔ \`lint\` ➔ \`git add\` ➔ \`git commit\` ➔ \`git push\` ➔ \`Vercel deploy\`.\n3. ☁️ **24/7 Cloud Engine**: Operates continuously even when your laptop is turned off.\n4. 💡 **Day-to-day Partner**: Assist you with coding, planning, and task execution.`;
        newLogCategory = 'AGENT';
        newLogMsg = `Listed pipeline rules & capabilities.`;
      }
      // 5. Greetings & Chit-chat
      else if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('hey') || lowerText.includes('talk') || lowerText.includes('how are you')) {
        replyText = `Hey there! 😊 I'm right here with you. What's on your mind today? Tell me what you'd like to work on, or let me know when you want to run a deployment!`;
        newLogCategory = 'AGENT';
        newLogMsg = `Replied conversationally to greeting.`;
      } 
      // 6. General conversational fallback
      else {
        replyText = `I hear you! I've noted: "${text}". Changes are saved locally. Whenever you're ready to push to GitHub and deploy to Vercel, just tell me 'deploy'!`;
        newLogCategory = 'AGENT';
        newLogMsg = `Processed note: "${text}". Kept changes local per Rule 1.`;
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
