import React, { useState } from 'react';

type TreeNode = {
  id: string;
  question: string;
  options: { label: string; nextNodeId: string | null; action?: string }[];
};

const MOCK_TREE: Record<string, TreeNode> = {
  'root': {
    id: 'root',
    question: 'What type of opportunity are you creating?',
    options: [
      { label: 'Enterprise Contract', nextNodeId: 'node_ent' },
      { label: 'SMB Contract', nextNodeId: 'node_smb' },
    ]
  },
  'node_ent': {
    id: 'node_ent',
    question: 'Has the client signed the NDA?',
    options: [
      { label: 'Yes', nextNodeId: null, action: 'Upload NDA to Salesforce Attachments.' },
      { label: 'No', nextNodeId: null, action: 'Request NDA signature via DocuSign before proceeding.' },
    ]
  },
  'node_smb': {
    id: 'node_smb',
    question: 'Standard terms apply?',
    options: [
      { label: 'Yes', nextNodeId: null, action: 'Select "Standard Terms" in the dropdown.' },
      { label: 'No', nextNodeId: null, action: 'Escalate to Legal team.' },
    ]
  }
};

const styles = {
  container: {
    background: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '24px',
    color: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
    maxWidth: '500px',
  },
  question: {
    fontSize: '18px',
    fontWeight: 500,
    marginBottom: '20px',
    color: '#818cf8',
  },
  optionBtn: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    marginBottom: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '14px',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  resultBox: {
    padding: '16px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    color: '#34d399',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  resetBtn: {
    marginTop: '16px',
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '12px',
  }
};

export const DecisionTree: React.FC = () => {
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  const [finalAction, setFinalAction] = useState<string | null>(null);

  const handleOptionClick = (nextNodeId: string | null, action?: string) => {
    if (nextNodeId) {
      setCurrentNodeId(nextNodeId);
    } else if (action) {
      setFinalAction(action);
    }
  };

  const resetTree = () => {
    setCurrentNodeId('root');
    setFinalAction(null);
  };

  const node = MOCK_TREE[currentNodeId];

  return (
    <div style={styles.container}>
      {!finalAction ? (
        <>
          <div style={styles.question}>{node.question}</div>
          {node.options.map((opt, idx) => (
            <button 
              key={idx} 
              style={styles.optionBtn}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
              onClick={() => handleOptionClick(opt.nextNodeId, opt.action)}
            >
              {opt.label}
            </button>
          ))}
        </>
      ) : (
        <>
          <div style={styles.question}>Recommended Action</div>
          <div style={styles.resultBox}>{finalAction}</div>
          <button style={styles.resetBtn} onClick={resetTree}>Start Over</button>
        </>
      )}
    </div>
  );
};
