import React, { useState, useEffect } from 'react';
import Expander from './Expander';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './StudyList.css';
import { searchPlaceholders } from '../mockData';
import StudiesService, { StudyResponse, DropdownValues } from '../services/studiesService';
import { useUserRoles } from '../hooks/useUserRoles';

const placeholderOptions = searchPlaceholders.studyList;

const StudyList: React.FC = () => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [tablePlaceholderIndex, setTablePlaceholderIndex] = useState(0);
  const [site, setSite] = useState('All');
  const [sponsor, setSponsor] = useState('All');
  const [protocol, setProtocol] = useState('All');
  const [showTable, setShowTable] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [studies, setStudies] = useState<StudyResponse[]>([]);
  const [dropdownValues, setDropdownValues] = useState<DropdownValues>({ sites: [], sponsors: [], protocols: [] });
  const [filteredSponsors, setFilteredSponsors] = useState<string[]>([]);
  const [filteredProtocols, setFilteredProtocols] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, loading: rolesLoading } = useUserRoles();

  // Extract unique values for dropdowns (fallback to studies data if dropdown values not loaded)
  const uniqueSites = ['All', ...(dropdownValues.sites.length > 0 ? dropdownValues.sites : Array.from(new Set(studies.map(study => study.site).filter(Boolean))))];
  const uniqueSponsors = ['All', ...(filteredSponsors.length > 0 ? filteredSponsors : (dropdownValues.sponsors.length > 0 ? dropdownValues.sponsors : Array.from(new Set(studies.map(study => study.sponsor).filter(Boolean)))))];
  const uniqueProtocols = ['All', ...(filteredProtocols.length > 0 ? filteredProtocols : (dropdownValues.protocols.length > 0 ? dropdownValues.protocols : Array.from(new Set(studies.map(study => study.protocol).filter(Boolean)))))];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholderOptions.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTablePlaceholderIndex((i) => (i + 1) % placeholderOptions.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch dropdown values when component mounts
  useEffect(() => {
    const fetchDropdownValues = async () => {
      if (rolesLoading) return;
      
      try {
        const type = isAdmin ? 'SD' : 'PI';
        const values = await StudiesService.getDropdownValues(type);
        setDropdownValues(values);
        // Initialize filtered values with all values
        setFilteredSponsors(values.sponsors || []);
        setFilteredProtocols(values.protocols || []);
      } catch (err) {
        console.warn('Failed to fetch dropdown values, will use study data instead');
      }
    };

    fetchDropdownValues();
  }, [isAdmin, rolesLoading]);

  // Handle site selection - filter sponsors and reset sponsor/protocol
  const handleSiteChange = async (selectedSite: string) => {
    setSite(selectedSite);
    setSponsor('All');
    setProtocol('All');
    
    if (selectedSite === 'All') {
      // Reset to all values
      setFilteredSponsors(dropdownValues.sponsors || []);
      setFilteredProtocols(dropdownValues.protocols || []);
    } else {
      // Fetch filtered sponsors for selected site
      setLoadingDropdowns(true);
      try {
        const type = isAdmin ? 'SD' : 'PI';
        const sponsors = await StudiesService.getFilteredSponsors(type, selectedSite);
        setFilteredSponsors(sponsors);
        // Reset protocols to all since sponsor is reset
        setFilteredProtocols(dropdownValues.protocols || []);
      } catch (err) {
        console.warn('Failed to fetch filtered sponsors');
        setFilteredSponsors(dropdownValues.sponsors || []);
      } finally {
        setLoadingDropdowns(false);
      }
    }
  };

  // Handle sponsor selection - filter protocols and reset protocol
  const handleSponsorChange = async (selectedSponsor: string) => {
    setSponsor(selectedSponsor);
    setProtocol('All');
    
    if (selectedSponsor === 'All' || site === 'All') {
      // Reset to all protocols
      setFilteredProtocols(dropdownValues.protocols || []);
    } else {
      // Fetch filtered protocols for selected site and sponsor
      setLoadingDropdowns(true);
      try {
        const type = isAdmin ? 'SD' : 'PI';
        const protocols = await StudiesService.getFilteredProtocols(type, site, selectedSponsor);
        setFilteredProtocols(protocols);
      } catch (err) {
        console.warn('Failed to fetch filtered protocols');
        setFilteredProtocols(dropdownValues.protocols || []);
      } finally {
        setLoadingDropdowns(false);
      }
    }
  };

  const fetchStudies = async () => {
    if (rolesLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Determine type based on admin status
      const type = isAdmin ? 'SD' : 'PI';
      
      // Pass filter values to the API
      const fetchedStudies = await StudiesService.getStudiesByUsername(
        type, 
        site !== 'All' ? site : undefined,
        sponsor !== 'All' ? sponsor : undefined,
        protocol !== 'All' ? protocol : undefined
      );
      setStudies(fetchedStudies);
    } catch (err) {
      setError('Failed to fetch studies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to studies
  const filteredStudies = studies.filter(study => {
    // Apply dropdown filters
    const siteMatch = site === 'All' || study.site === site;
    const sponsorMatch = sponsor === 'All' || study.sponsor === sponsor;
    const protocolMatch = protocol === 'All' || study.protocol === protocol;
    
    // Apply search filter
    const searchMatch = !tableSearch || Object.values(study).some(val =>
      String(val).toLowerCase().includes(tableSearch.toLowerCase())
    );
    
    return siteMatch && sponsorMatch && protocolMatch && searchMatch;
  });

  // Function to highlight search terms in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : (
        part
      )
    );
  };

  // Reset function
  const handleReset = () => {
    setSite('All');
    setSponsor('All');
    setProtocol('All');
    setShowTable(false);
    setStudies([]);
    setError(null);
    // Reset filtered values to all values
    setFilteredSponsors(dropdownValues.sponsors || []);
    setFilteredProtocols(dropdownValues.protocols || []);
  };

  return (
    <div className="studylist-container">
      <Expander title="Search Site Studies" defaultExpanded>
        <div className="studylist-filters-row">
          <div className="studylist-filter">
            <label>Site*</label>
            <select 
              value={site} 
              onChange={e => handleSiteChange(e.target.value)}
              disabled={loadingDropdowns}
            >
              {uniqueSites.map((siteOption, index) => (
                <option key={index} value={siteOption}>{siteOption}</option>
              ))}
            </select>
          </div>
          <div className="studylist-filter">
            <label>Sponsor*</label>
            <select 
              value={sponsor} 
              onChange={e => handleSponsorChange(e.target.value)}
              disabled={loadingDropdowns}
            >
              {uniqueSponsors.map((sponsorOption, index) => (
                <option key={index} value={sponsorOption}>{sponsorOption}</option>
              ))}
            </select>
          </div>
          <div className="studylist-filter">
            <label>Protocol</label>
            <select 
              value={protocol} 
              onChange={e => setProtocol(e.target.value)}
              disabled={loadingDropdowns}
            >
              {uniqueProtocols.map((protocolOption, index) => (
                <option key={index} value={protocolOption}>{protocolOption}</option>
              ))}
            </select>
          </div>
        </div>
        {loadingDropdowns && (
          <div style={{ textAlign: 'center', padding: '10px', color: 'var(--color-muted)', fontSize: '14px' }}>
            Loading filtered options...
          </div>
        )}
        <div className="studylist-buttons-row">
          <button className="studylist-reset-btn" type="button" onClick={handleReset}>Reset</button>
          <button className="studylist-list-btn" type="button" onClick={() => { setShowTable(true); fetchStudies(); }}>List Study</button>
        </div>
      </Expander>
      <Expander title="Study List" defaultExpanded>
        {showTable && (
          <>
            <div className="studylist-table-search-row">
              <input
                className="studylist-search-input"
                type="text"
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                placeholder={placeholderOptions[tablePlaceholderIndex]}
              />
              <span className="studylist-search-icon"><FiSearch /></span>
            </div>
            <div className="studylist-table-wrapper">
              <table className="studylist-table">
                <thead>
                  <tr>
                    <th>Sponsor</th>
                    <th>Protocol</th>
                    <th>Study Type</th>
                    <th>Study Status</th>
                    <th>Description</th>
                    <th>Phase</th>
                    <th>Monitoring Schedule</th>
                    <th>CRC Name</th>
                    <th>Assessment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>
                        Loading studies...
                      </td>
                    </tr>
                  )}
                  {error && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                        {error}
                      </td>
                    </tr>
                  )}
                  {!loading && !error && filteredStudies.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>
                        No studies found
                      </td>
                    </tr>
                  )}
                  {!loading && !error && filteredStudies.map((study, idx) => (
                    <tr 
                      key={idx} 
                      className={`studylist-table-row ${study.assessment_status === 'Completed' ? 'has-assessment' : ''}`} 
                      onClick={() => navigate('/risk-evaluation', { state: { study } })} 
                      style={{ cursor: 'pointer' }}
                      title={study.assessment_status === 'Completed' ? 'Click to view/edit existing assessment' : 'Click to create new assessment'}
                    >
                      <td>{highlightSearchTerm(study.sponsor || '', tableSearch)}</td>
                      <td>{highlightSearchTerm(study.protocol || '', tableSearch)}</td>
                      <td>{highlightSearchTerm(study.studytypetext || '', tableSearch)}</td>
                      <td>{highlightSearchTerm(study.status || '', tableSearch)}</td>
                      <td>{highlightSearchTerm(study.description || '', tableSearch)}</td>
                      <td>{highlightSearchTerm(study.phase || '', tableSearch)}</td>
                      <td>{highlightSearchTerm(study.monitoring_schedule || '', tableSearch)}</td>
                      <td>{highlightSearchTerm(study.crcname || '', tableSearch)}</td>
                      <td>
                        <span className={`assessment-status ${study.assessment_status?.toLowerCase()}`}>
                          {highlightSearchTerm(study.assessment_status || 'Not Started', tableSearch)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Expander>
    </div>
  );
};

export default StudyList; 