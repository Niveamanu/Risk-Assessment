import React, { useState, ReactNode } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import './Expander.css';

interface ExpanderProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

const Expander: React.FC<ExpanderProps> = ({ title, children, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`expander${expanded ? ' expanded' : ''}`}> 
      <button
        className="expander-header"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className="expander-title">{title}</span>
        <FiChevronDown className={`expander-chevron${expanded ? ' rotated' : ''}`} />
      </button>
      {expanded && <div className="expander-content">{children}</div>}
    </div>
  );
};

export default Expander; 