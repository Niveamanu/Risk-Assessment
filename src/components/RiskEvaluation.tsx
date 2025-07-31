import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import Expander from './Expander';
import { FiDownload, FiEdit2, FiEye, FiLock } from 'react-icons/fi';
import './RiskEvaluation.css';
import { getCurrentDate, getRiskLevel, riskEvaluationData } from '../mockData';
import AssessmentService, { AssessmentMetadata, AssessmentCreate, RiskMitigationPlan, RiskDashboard, SummaryComment, CompleteAssessment } from '../services/assessmentService';
import DashboardService from '../services/dashboardService';
import useMsalUser from '../hooks/useMsalUser';
import PDFService, { PDFAssessmentData } from '../services/pdfService';
import { useMsal } from '@azure/msal-react';

// Use riskEvaluationData as fallback defaults
const defaultMonitoringOptions = riskEvaluationData.monitoringOptions;
const defaultSteps = riskEvaluationData.steps;

const RiskEvaluation: React.FC = () => {
  const location = useLocation();
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [searchParams] = useSearchParams();
  const studyIdFromQuery = searchParams.get('studyId');
  const study = location.state?.study;
  const userInfo = useMsalUser();
  const { accounts } = useMsal();
  const initialSection = location.state?.section || 'regulatory';
  
  // Debug IDs from URL
  console.log('Assessment ID from URL:', assessmentId);
  console.log('Study ID from query params:', studyIdFromQuery);
  
  // Debug study data
  console.log('Study received from navigation:', study);
  console.log('Study ID from navigation (study_id):', study?.study_id);
  console.log('Study ID from navigation (id):', study?.id);
  console.log('Study ID type (study_id):', typeof study?.study_id);
  console.log('Study ID type (id):', typeof study?.id);
  console.log('Study monitoring_schedule:', study?.monitoring_schedule);
  console.log('Study monitoring:', study?.monitoring);
  console.log('All study fields:', Object.keys(study || {}));
  
  // State for metadata
  const [metadata, setMetadata] = useState<AssessmentMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingAssessment, setExistingAssessment] = useState<CompleteAssessment | null>(null);
  
  // State for form data
  const [monitoring, setMonitoring] = useState(study?.monitoring_schedule || '');
  const [assessmentDate, setAssessmentDate] = useState(getCurrentDate());
  const [nextReviewDate, setNextReviewDate] = useState('');
  const [sectionComments, setSectionComments] = useState<{[key: string]: string}>({});
  const [section, setSection] = useState(initialSection);
  
  // State for risk data
  const [riskData, setRiskData] = useState<{[key: string]: Array<{
    risk_factor_id: number;
    risk_factor_text: string;
    severity: string;
    likelihood: string;
    mitigation: string;
    custom_notes: string;
  }>}>({});
  
  // State for summary page data
  const [riskMitigationPlans, setRiskMitigationPlans] = useState<RiskMitigationPlan[]>([
    { risk_item: '', responsible_person: '', mitigation_strategy: '', target_date: '', status: 'Pending', priority_level: 'High' },
    { risk_item: '', responsible_person: '', mitigation_strategy: '', target_date: '', status: 'Pending', priority_level: 'High' },
    { risk_item: '', responsible_person: '', mitigation_strategy: '', target_date: '', status: 'Pending', priority_level: 'High' }
  ]);
  
  // State for assessment status
  const [assessmentStatus, setAssessmentStatus] = useState<string>('In Progress');
  const [riskDashboard, setRiskDashboard] = useState<RiskDashboard>({
    total_risks: 0,
    high_risk_count: 0,
    medium_risk_count: 0,
    low_risk_count: 0,
    total_score: 0,
    overall_risk_level: '',
    risk_level_criteria: ''
  });
  
  // State for authorization
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [authorizationLoading, setAuthorizationLoading] = useState<boolean>(true);
  const [authorizationError, setAuthorizationError] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<{
    canEdit: boolean;
    userEmail: string;
    piEmail?: string;
    sdEmail?: string;
    reason?: string;
  } | null>(null);
  
  // State for summary comments
  const [summaryComments, setSummaryComments] = useState<SummaryComment[]>([]);
  const [summaryCommentText, setSummaryCommentText] = useState('');

  // Function to calculate risk dashboard values from current risk data
  const calculateRiskDashboard = () => {
    let totalRisks = 0;
    let totalScore = 0;
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    
    Object.values(riskData).forEach(sectionRisks => {
      sectionRisks.forEach(risk => {
        if (risk.severity && risk.likelihood) {
          const severity = parseInt(risk.severity);
          const likelihood = parseInt(risk.likelihood);
          const riskScore = severity * likelihood;
          
          totalRisks++;
          totalScore += riskScore;
          
          if (riskScore >= 7) highRiskCount++;
          else if (riskScore >= 4) mediumRiskCount++;
          else lowRiskCount++;
        }
      });
    });
    
    // Determine overall risk level and criteria
    let overallRiskLevel = '';
    let riskLevelCriteria = '';
    
    if (totalScore <= 15 && highRiskCount === 0) {
      overallRiskLevel = 'Low';
      riskLevelCriteria = 'Low Risk (Total Score ≤15, No High-Risk items)';
    } else if (totalScore <= 30 && highRiskCount < 3) {
      overallRiskLevel = 'Medium';
      riskLevelCriteria = 'Medium Risk (Total Score 16-30, <3 High-Risk items)';
    } else {
      overallRiskLevel = 'High';
      riskLevelCriteria = 'High Risk (Total Score >30, ≥3 High-Risk items)';
    }
    
    return {
      total_risks: totalRisks,
      high_risk_count: highRiskCount,
      medium_risk_count: mediumRiskCount,
      low_risk_count: lowRiskCount,
      total_score: totalScore,
      overall_risk_level: overallRiskLevel,
      risk_level_criteria: riskLevelCriteria
    };
  };

  // Function to determine which risk level checkbox should be checked
  const getRiskLevelCheckboxState = () => {
    const dashboard = calculateRiskDashboard();
    return {
      lowRisk: dashboard.overall_risk_level === 'Low',
      mediumRisk: dashboard.overall_risk_level === 'Medium',
      highRisk: dashboard.overall_risk_level === 'High'
    };
  };

  // Function to check user authorization for editing
  const checkUserAuthorization = async (studyId: number) => {
    try {
      setAuthorizationLoading(true);
      setAuthorizationError(null);
      
      const permissions = await DashboardService.checkAssessmentEditPermissions(studyId);
      setUserPermissions(permissions);
      setCanEdit(permissions.canEdit);
      
      console.log('Authorization check result:', permissions);
      
      if (!permissions.canEdit) {
        console.log('User does not have edit permissions. Reason:', permissions.reason);
      }
    } catch (error) {
      console.error('Error checking user authorization:', error);
      setAuthorizationError('Failed to check user permissions');
      setCanEdit(false);
    } finally {
      setAuthorizationLoading(false);
    }
  };

  // Fallback authorization check using notification data
  const checkUserAuthorizationFromNotificationData = async (studyData: any) => {
    try {
      console.log('🔍 Fallback authorization check using notification data');
      console.log('📊 Study data for authorization:', studyData);
      console.log('👤 UserInfo from MSAL:', userInfo);
      console.log('👤 MSAL accounts:', accounts);
      
      // Try multiple sources for current user email
      let currentUserEmail = '';
      
      // Try MSAL user info first
      if (userInfo?.email) {
        currentUserEmail = userInfo.email;
        console.log('✅ Found email from userInfo.email:', currentUserEmail);
      } else if (userInfo?.username) {
        currentUserEmail = userInfo.username;
        console.log('✅ Found email from userInfo.username:', currentUserEmail);
      } else if (accounts && accounts.length > 0) {
        // Try to get from MSAL accounts directly
        currentUserEmail = accounts[0].username;
        console.log('✅ Found email from MSAL accounts:', currentUserEmail);
      }
      
      console.log('👤 Final current user email:', currentUserEmail);
      
      if (!currentUserEmail) {
        console.log('❌ No current user email found from any source');
        console.log('🔍 Available userInfo:', userInfo);
        console.log('🔍 userInfo keys:', userInfo ? Object.keys(userInfo) : 'null');
        console.log('🔍 Available accounts:', accounts);
        setCanEdit(false);
        setUserPermissions({
          canEdit: false,
          userEmail: '',
          piEmail: studyData.principal_investigator_email,
          sdEmail: studyData.site_director_email,
          reason: 'No current user email found from any source'
        });
        return;
      }
      
      // Check if current user is PI or SD
      const isPI = currentUserEmail.toLowerCase() === studyData.principal_investigator_email?.toLowerCase();
      const isSD = currentUserEmail.toLowerCase() === studyData.site_director_email?.toLowerCase();
      
      console.log('🔍 Authorization check results:');
      console.log('  - Current User Email:', currentUserEmail);
      console.log('  - PI Email:', studyData.principal_investigator_email);
      console.log('  - SD Email:', studyData.site_director_email);
      console.log('  - Is PI:', isPI);
      console.log('  - Is SD:', isSD);
      
      const canEditAssessment = isPI || isSD;
      
      setCanEdit(canEditAssessment);
      setUserPermissions({
        canEdit: canEditAssessment,
        userEmail: currentUserEmail,
        piEmail: studyData.principal_investigator_email,
        sdEmail: studyData.site_director_email,
        reason: canEditAssessment ? 
          (isPI ? 'User is Principal Investigator' : 'User is Site Director') : 
          'User is not PI or SD for this study'
      });
      
      console.log('✅ Fallback authorization result:', {
        canEdit: canEditAssessment,
        reason: canEditAssessment ? 
          (isPI ? 'User is Principal Investigator' : 'User is Site Director') : 
          'User is not PI or SD for this study'
      });
      
    } catch (error) {
      console.error('Error in fallback authorization check:', error);
      setCanEdit(false);
      setUserPermissions({
        canEdit: false,
        userEmail: '',
        piEmail: studyData.principal_investigator_email,
        sdEmail: studyData.site_director_email,
        reason: 'Fallback authorization check failed'
      });
    }
  };

  // Function to validate all risk scores (mandatory validation)
  const validateAllRiskScores = () => {
    const missingScores: string[] = [];
    
    Object.entries(riskData).forEach(([sectionKey, sectionRisks]) => {
      sectionRisks.forEach((risk, idx) => {
        if (!risk.severity || !risk.likelihood) {
          missingScores.push(`${sectionKey} - ${risk.risk_factor_text} (Row ${idx + 1})`);
        }
      });
    });
    
    return missingScores;
  };

  // Function to validate current section risk scores
  const validateCurrentSectionRiskScores = () => {
    const currentSectionRisks = riskData[section] || [];
    const missingScores: string[] = [];
    
    currentSectionRisks.forEach((risk, idx) => {
      if (!risk.severity || !risk.likelihood) {
        missingScores.push(`${risk.risk_factor_text} (Row ${idx + 1})`);
      }
    });
    
    return missingScores;
  };

  // Function to show validation error
  const showValidationError = (missingScores: string[]) => {
    const message = `Please fill in all Severity and Likelihood scores before proceeding.\n\nMissing scores:\n${missingScores.join('\n')}`;
    alert(message);
  };
  
  // Debug effect to track section comments changes
  useEffect(() => {
    console.log('🔄 Section comments changed:', sectionComments);
  }, [sectionComments]);
  
  // Debug effect to track section changes
  useEffect(() => {
    console.log('🔄 Section changed to:', section);
    console.log('🔄 Comment for current section:', sectionComments[section]);
  }, [section, sectionComments]);
  

  
  // Function to add a new risk mitigation plan row
  const addRiskMitigationPlan = () => {
    setRiskMitigationPlans([
      ...riskMitigationPlans,
      { risk_item: '', responsible_person: '', mitigation_strategy: '', target_date: '', status: 'Pending', priority_level: 'High' }
    ]);
  };

  // Function to get plans with data for preview
  const getPlansWithData = () => {
    return riskMitigationPlans.filter(plan => 
      plan.risk_item.trim() !== '' || 
      plan.responsible_person.trim() !== '' || 
      plan.mitigation_strategy.trim() !== ''
    );
  };

  // Custom alert function with styled button
  const showCustomAlert = (message: string) => {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: var(--color-card);
      border-radius: 10px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      border: 1px solid var(--color-border);
    `;

    // Create message content
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      margin-bottom: 20px;
      white-space: pre-line;
      font-size: 16px;
      line-height: 1.5;
      color: var(--color-text);
    `;
    messageDiv.textContent = message;

    // Create OK button
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.cssText = `
      background: var(--color-secondary);
      color: var(--color-text);
      border: none;
      border-radius: 7px;
      padding: 10px 24px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      transition: background 0.2s;
      float: right;
    `;

    // Add hover effect
    okButton.addEventListener('mouseenter', () => {
      okButton.style.background = '#ffe98c';
    });
    okButton.addEventListener('mouseleave', () => {
      okButton.style.background = 'var(--color-secondary)';
    });

    // Add click handler to close modal
    okButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // Add click handler to overlay to close modal
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    // Assemble modal
    modal.appendChild(messageDiv);
    modal.appendChild(okButton);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Focus the button for accessibility
    okButton.focus();
  };

  // Function to populate form with existing assessment data
  const populateFormWithExistingData = (assessmentData: CompleteAssessment, metadata: AssessmentMetadata) => {
    const { assessment, risk_scores, risk_mitigation_plans, risk_dashboard, summary_comments } = assessmentData;
    
    console.log('🔍 Populating form with existing data...');
    console.log('📊 Assessment data:', assessment);
    console.log('📊 Risk scores:', risk_scores);
    console.log('📊 Metadata sections:', metadata.assessment_sections);
    console.log('📊 Metadata risk factors:', metadata.risk_factors);
    
    // Populate basic form fields
    setMonitoring(assessment.monitoring_schedule || '');
    setAssessmentDate(assessment.assessment_date || getCurrentDate());
    setNextReviewDate(assessment.next_review_date || '');
    setAssessmentStatus(assessment.status || 'Pending Review');
    // Initialize section comments with existing assessment comments
    if (assessmentData.section_comments && assessmentData.section_comments.length > 0) {
      // Use section comments from database
      const sectionCommentMap: {[key: string]: string} = {};
      console.log('📝 Section comments from backend:', assessmentData.section_comments);
      assessmentData.section_comments.forEach(sectionComment => {
        sectionCommentMap[sectionComment.section_key] = sectionComment.comment_text;
        console.log(`📝 Setting comment for section ${sectionComment.section_key}:`, sectionComment.comment_text);
      });
      console.log('📝 Final section comment map:', sectionCommentMap);
      setSectionComments(sectionCommentMap);
    } else if (assessment.comments) {
      // Fallback to old format if section_comments not available
      const existingComments = assessment.comments;
      if (existingComments.includes(';')) {
        // If comments contain semicolons, they might be section-specific
        const commentParts = existingComments.split(';').map(c => c.trim()).filter(c => c);
        const sectionCommentMap: {[key: string]: string} = {};
        commentParts.forEach((comment, index) => {
          const sectionKey = metadata.assessment_sections[index]?.section_key || `section_${index}`;
          sectionCommentMap[sectionKey] = comment;
        });
        setSectionComments(sectionCommentMap);
      } else {
        // Single comment - assign to current section
        setSectionComments({ [section]: existingComments });
      }
    }
    
    // Populate risk data
    const populatedRiskData: {[key: string]: Array<{
      risk_factor_id: number;
      risk_factor_text: string;
      severity: string;
      likelihood: string;
      mitigation: string;
      custom_notes: string;
    }>} = {};
    
    // Initialize with empty data first
    metadata.assessment_sections.forEach((section: any) => {
      const sectionRiskFactors = metadata.risk_factors.filter(
        (rf: any) => rf.assessment_section_id === section.id && rf.is_active
      );
      populatedRiskData[section.section_key] = sectionRiskFactors.map((rf: any) => ({
        risk_factor_id: rf.id,
        risk_factor_text: rf.risk_factor_text,
        severity: '',
        likelihood: '',
        mitigation: '',
        custom_notes: '',
      }));
    });
    
    console.log('📊 Initial populated risk data:', populatedRiskData);
    
    // Populate with existing risk scores
    risk_scores.forEach(riskScore => {
      console.log(`🔍 Processing risk score:`, riskScore);
      
      // Find the section for this risk factor
      const riskFactor = metadata.risk_factors.find(rf => rf.id === riskScore.risk_factor_id);
      console.log(`🔍 Found risk factor:`, riskFactor);
      
      if (riskFactor) {
        const section = metadata.assessment_sections.find(s => s.id === riskFactor.assessment_section_id);
        console.log(`🔍 Found section:`, section);
        
        if (section) {
          const sectionKey = section.section_key;
          const existingRow = populatedRiskData[sectionKey]?.find(row => row.risk_factor_id === riskScore.risk_factor_id);
          console.log(`🔍 Found existing row in section ${sectionKey}:`, existingRow);
          
          if (existingRow) {
            // Fix: Ensure severity and likelihood are explicitly converted to strings and handle null/undefined
            existingRow.severity = (riskScore as any).severity ? (riskScore as any).severity.toString() : '';
            existingRow.likelihood = (riskScore as any).likelihood ? (riskScore as any).likelihood.toString() : '';
            existingRow.mitigation = riskScore.mitigation_actions || '';
            existingRow.custom_notes = riskScore.custom_notes || '';
            console.log(`✅ Updated row with values: severity=${existingRow.severity}, likelihood=${existingRow.likelihood}, mitigation=${existingRow.mitigation}, custom_notes=${existingRow.custom_notes}`);
          } else {
            console.log(`❌ No matching row found for risk factor ID ${riskScore.risk_factor_id} in section ${sectionKey}`);
          }
        } else {
          console.log(`❌ No section found for assessment_section_id ${riskFactor.assessment_section_id}`);
        }
      } else {
        console.log(`❌ No risk factor found for ID ${riskScore.risk_factor_id}`);
        
        // Fallback: try to match by risk factor text if ID doesn't match
        console.log(`🔄 Trying fallback matching by text...`);
        // Get the risk factor text from metadata using the risk_factor_id
        const riskFactorText = metadata.risk_factors.find(rf => rf.id === riskScore.risk_factor_id)?.risk_factor_text;
        const matchingRiskFactor = metadata.risk_factors.find(rf => 
          rf.risk_factor_text.toLowerCase() === riskFactorText?.toLowerCase()
        );
        
        if (matchingRiskFactor) {
          console.log(`✅ Found matching risk factor by text:`, matchingRiskFactor);
          const section = metadata.assessment_sections.find(s => s.id === matchingRiskFactor.assessment_section_id);
          
          if (section) {
            const sectionKey = section.section_key;
            const existingRow = populatedRiskData[sectionKey]?.find(row => row.risk_factor_id === matchingRiskFactor.id);
            
            if (existingRow) {
              // Fix: Ensure severity and likelihood are explicitly converted to strings and handle null/undefined
              existingRow.severity = (riskScore as any).severity ? (riskScore as any).severity.toString() : '';
              existingRow.likelihood = (riskScore as any).likelihood ? (riskScore as any).likelihood.toString() : '';
              existingRow.mitigation = riskScore.mitigation_actions || '';
              existingRow.custom_notes = riskScore.custom_notes || '';
              console.log(`✅ Updated row with fallback values: severity=${existingRow.severity}, likelihood=${existingRow.likelihood}, mitigation=${existingRow.mitigation}, custom_notes=${existingRow.custom_notes}`);
            }
          }
        }
      }
    });
    
    console.log('📊 Final populated risk data:', populatedRiskData);
    setRiskData(populatedRiskData);
    
    // Populate risk mitigation plans
    if (risk_mitigation_plans.length > 0) {
      setRiskMitigationPlans(risk_mitigation_plans.map(plan => ({
        risk_item: plan.risk_item,
        responsible_person: plan.responsible_person,
        mitigation_strategy: plan.mitigation_strategy,
        target_date: plan.target_date,
        status: plan.status,
        priority_level: plan.priority_level
      })));
    }
    
    // Populate risk dashboard
    if (risk_dashboard) {
      setRiskDashboard({
        total_risks: risk_dashboard.total_risks,
        high_risk_count: risk_dashboard.high_risk_count,
        medium_risk_count: risk_dashboard.medium_risk_count,
        low_risk_count: risk_dashboard.low_risk_count,
        total_score: risk_dashboard.total_score,
        overall_risk_level: risk_dashboard.overall_risk_level,
        risk_level_criteria: risk_dashboard.risk_level_criteria
      });
    } else {
      // Calculate risk dashboard from populated risk data
      const calculatedDashboard = calculateRiskDashboard();
      setRiskDashboard(calculatedDashboard);
    }
    
    // Populate summary comments
    if (summary_comments.length > 0) {
      setSummaryComments(summary_comments.map(comment => ({
        comment_type: comment.comment_type,
        comment_text: comment.comment_text
      })));
      // Set the first summary comment as the summary text
      if (summary_comments[0]) {
        setSummaryCommentText(summary_comments[0].comment_text);
      }
    }
    
    console.log('✅ Form populated with existing assessment data');
  };
  
  // Use metadata or fallback to defaults
  const monitoringOptions = metadata ? ['', ...defaultMonitoringOptions] : defaultMonitoringOptions;
  const steps = metadata ? [
    ...metadata.assessment_sections.map((s: any) => ({ 
      key: s.section_key, 
      label: s.section_key === 'regulatory' ? 'Regulatory' :
             s.section_key === 'data-quality' ? 'Data Quality' :
             s.section_key === 'patient-safety' ? 'Patient Safety' :
             s.section_key === 'compliance' ? 'Compliance' :
             s.section_key === 'site-operations' ? 'Site Operations' :
             s.section_key === 'summary' ? 'Summary' : s.section_title
    })),
    // Only add summary step if it's not already in the metadata
    ...(metadata.assessment_sections.some((s: any) => s.section_key === 'summary') ? [] : [{ key: 'summary', label: 'Summary' }])
  ] : defaultSteps;
  
  // Get section title from metadata or fallback to riskEvaluationData
  const getSectionTitle = (sectionKey: string) => {
    if (metadata) {
      return metadata.assessment_sections.find((s: any) => s.section_key === sectionKey)?.section_title || '';
    } else {
      // Use fallback data from riskEvaluationData
      return (riskEvaluationData.riskSectionData as any)[sectionKey]?.title || '';
    }
  };
  
  const sectionData = section !== 'summary' ? 
    { title: getSectionTitle(section) } : undefined;
  
  // Get current section's risk data
  const rows = riskData[section] || [];
  console.log('Current section:', section);
  console.log('Risk data:', riskData);
  console.log('Rows for current section:', rows);
  
  // Calculate section summary
  const sectionSummary = rows.reduce((acc, row) => {
    const sev = row.severity ? Number(row.severity) : 0;
    const lik = row.likelihood ? Number(row.likelihood) : 0;
    const score = sev * lik;
    if (score > 0) {
      acc.totalScore += score;
      acc.totalRisks += 1;
      if (score >= 7) acc.highRisks += 1;
      else if (score >= 3) acc.mediumRisks += 1;
      else acc.lowRisks += 1;
    }
    return acc;
  }, { totalScore: 0, totalRisks: 0, highRisks: 0, mediumRisks: 0, lowRisks: 0 });

  // Fetch metadata and existing assessment data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Test backend connection first
        const isBackendAvailable = await AssessmentService.testConnection();
        console.log('Backend available:', isBackendAvailable);
        
        const metadataResponse = await AssessmentService.getMetadata();
        console.log('Metadata response:', metadataResponse);
        
        // Check if the response has the expected structure
        if (!metadataResponse || !metadataResponse.assessment_sections || !metadataResponse.risk_factors) {
          console.error('❌ Metadata response missing expected structure, using fallback data');
          // Instead of setting error, throw to trigger fallback
          throw new Error('Metadata response missing expected structure');
        }
        
        setMetadata(metadataResponse);
        
        // Initialize risk data for each section
        const initialRiskData: {[key: string]: Array<{
          risk_factor_id: number;
          risk_factor_text: string;
          severity: string;
          likelihood: string;
          mitigation: string;
          custom_notes: string;
        }>} = {};
        
        metadataResponse.assessment_sections.forEach((section: any) => {
          const sectionRiskFactors = metadataResponse.risk_factors.filter(
            (rf: any) => rf.assessment_section_id === section.id && rf.is_active
          );
          initialRiskData[section.section_key] = sectionRiskFactors.map((rf: any) => ({
            risk_factor_id: rf.id,
            risk_factor_text: rf.risk_factor_text,
            severity: '',
            likelihood: '',
            mitigation: '',
            custom_notes: '',
          }));
        });
        
        setRiskData(initialRiskData);
        
        // Fetch existing assessment data if study is available or assessment ID is provided
        if (study) {
          const studyId = study.study_id || study.id; // Use study_id if available, otherwise fall back to id
          if (studyId) {
            console.log('🔍 Fetching existing assessment data for study ID:', studyId);
            
            // Check user authorization for editing
            await checkUserAuthorization(studyId);
            
            const existingAssessmentData = await AssessmentService.getCompleteAssessmentByStudyId(studyId);
            
            if (existingAssessmentData) {
              console.log('📦 Existing assessment data found:', existingAssessmentData);
              setExistingAssessment(existingAssessmentData);
              
              // Populate form with existing data
              populateFormWithExistingData(existingAssessmentData, metadataResponse);
            } else {
              console.log('📭 No existing assessment data found for study ID:', studyId);
            }
          }
        } else if (assessmentId) {
          // Fetch assessment data by assessment ID from URL
          console.log('🔍 Fetching existing assessment data for assessment ID:', assessmentId);
          try {
            const existingAssessmentData = await AssessmentService.getCompleteAssessmentById(parseInt(assessmentId));
            
            if (existingAssessmentData) {
              console.log('📦 Existing assessment data found:', existingAssessmentData);
              setExistingAssessment(existingAssessmentData);
              
              // Check user authorization for editing using study_id from assessment
              const studyId = existingAssessmentData.assessment.study_id;
              if (studyId) {
                await checkUserAuthorization(studyId);
              }
              
              // Populate form with existing data
              populateFormWithExistingData(existingAssessmentData, metadataResponse);
            } else {
              console.log('📭 No existing assessment data found for assessment ID:', assessmentId);
            }
          } catch (err) {
            console.error('Error fetching assessment by ID:', err);
          }
        }
        
        // If we have both assessment ID and study ID from URL, we can use either method
        // The assessment ID method is preferred as it's more specific
        if (assessmentId && studyIdFromQuery) {
          console.log('🔍 Both assessment ID and study ID provided from URL');
          console.log('📊 Assessment ID:', assessmentId, 'Study ID:', studyIdFromQuery);
        }
      } catch (err) {
        console.error('Error fetching metadata or backend not available:', err);
        console.log('✅ Using fallback riskEvaluationData from mockData.ts');
        
        // Use riskEvaluationData as fallback with sequential IDs
        const fallbackRiskFactors: Array<{
          id: number;
          assessment_section_id: number;
          risk_factor_text: string;
          risk_factor_code: string;
          description: string;
          is_active: boolean;
        }> = [];
        let fallbackRiskFactorId = 1;
        
        Object.entries(riskEvaluationData.riskSectionData).forEach(([sectionKey, sectionData], sectionIndex) => {
          const sectionId = sectionIndex + 1;
          sectionData.risks.forEach((risk) => {
            fallbackRiskFactors.push({
              id: fallbackRiskFactorId,
              assessment_section_id: sectionId,
              risk_factor_text: risk.risk,
              risk_factor_code: `${sectionKey.toUpperCase().substring(0, 3)}${fallbackRiskFactorId.toString().padStart(3, '0')}`,
              description: risk.risk,
              is_active: true
            });
            fallbackRiskFactorId++;
          });
        });
        
        const fallbackMetadata: AssessmentMetadata = {
          assessment_sections: riskEvaluationData.steps.map((step, index) => ({
            id: index + 1,
            section_key: step.key,
            section_title: step.label,
            created_at: new Date().toISOString()
          })),
          risk_factors: fallbackRiskFactors.map(rf => ({
            ...rf,
            created_at: new Date().toISOString()
          }))
        };
        
        setMetadata(fallbackMetadata);
        
        // Initialize risk data using fallback data with sequential IDs
        const initialRiskData: {[key: string]: Array<{
          risk_factor_id: number;
          risk_factor_text: string;
          severity: string;
          likelihood: string;
          mitigation: string;
          custom_notes: string;
        }>} = {};
        
        let initialRiskFactorId = 1;
        Object.entries(riskEvaluationData.riskSectionData).forEach(([sectionKey, sectionData]) => {
          initialRiskData[sectionKey] = sectionData.risks.map((risk) => ({
            risk_factor_id: initialRiskFactorId++,
            risk_factor_text: risk.risk,
            severity: '',
            likelihood: '',
            mitigation: '',
            custom_notes: '',
          }));
        });
        
        setRiskData(initialRiskData);
        setError(null); // Clear any previous errors
        
        // Show development mode message
        console.log('✅ Using fallback riskEvaluationData');
        console.log('📊 Fallback metadata:', fallbackMetadata);
        console.log('📊 Initial risk data:', initialRiskData);
        console.log('📊 Available sections:', Object.keys(initialRiskData));
        
        // Optional: Show a brief message to user that backend is not available
        setTimeout(() => {
          console.log('ℹ️ Running in development mode with mock data');
        }, 1000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Retry authorization when userInfo or accounts become available
  useEffect(() => {
    if ((userInfo || accounts) && !canEdit && study && !authorizationLoading) {
      console.log('🔄 Retrying authorization with available user data');
      setTimeout(() => {
        checkUserAuthorizationFromNotificationData(study);
      }, 1000);
    }
  }, [userInfo, accounts, canEdit, study, authorizationLoading]);

  const handleInput = (idx: number, field: 'severity' | 'likelihood' | 'mitigation' | 'custom_notes', value: string) => {
    // Clean the value - remove any invalid characters and ensure it's a valid number for severity/likelihood
    let cleanValue = value;
    if (field === 'severity' || field === 'likelihood') {
      // Remove any non-numeric characters except empty string
      cleanValue = value.replace(/[^0-9]/g, '');
      // Ensure the value is within 1-3 range or empty
      if (cleanValue !== '') {
        const numValue = parseInt(cleanValue);
        if (numValue < 1) cleanValue = '1';
        if (numValue > 3) cleanValue = '3';
      }
    }
    
    setRiskData(prev => ({
      ...prev,
      [section]: prev[section].map((row, i) => i === idx ? { ...row, [field]: cleanValue } : row)
    }));
  };

  const handleSaveAndProceed = async () => {
    const currentIdx = steps.findIndex((s: any) => s.key === section);
    
    // Validate current section risk scores (mandatory validation)
    const missingScores = validateCurrentSectionRiskScores();
    if (missingScores.length > 0) {
      showValidationError(missingScores);
      return;
    }
    
    // Check if current section has any data
    const currentSectionData = riskData[section] || [];
    const hasData = currentSectionData.some(row => row.severity || row.likelihood || row.mitigation);
    
    if (!hasData) {
      alert('Please enter at least one risk assessment before proceeding.');
      return;
    }
    
    if (currentIdx < steps.length - 1) {
      const nextSection = steps[currentIdx + 1].key;
      setSection(nextSection);
      // Don't clear comments - they're now section-specific
      
      // Show navigation message
      const nextSectionTitle = steps[currentIdx + 1].label;
      console.log(`Proceeding to ${nextSectionTitle} section`);
    } else {
      // Save the complete assessment
      await saveAssessment();
    }
  };

  const handleDownloadPDF = () => {
    if (!study && !existingAssessment) {
      showCustomAlert('No study data available for download.');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data for PDF generation
      const pdfData: PDFAssessmentData = {
        study: {
          id: study?.id || existingAssessment?.assessment.study_id || 0,
          site: study?.site || 'Unknown Site',
          sponsor: study?.sponsor || 'Unknown Sponsor',
          protocol: study?.protocol || 'Unknown Protocol',
          studytypetext: study?.studytypetext || 'Unknown Type',
          description: study?.description || 'No description available',
          status: study?.status || 'Unknown Status',
          phase: study?.phase || 'Unknown Phase',
          monitoring_schedule: monitoring || 'Not specified'
        },
        assessment: {
          id: existingAssessment?.assessment.id || 0,
          assessment_date: assessmentDate,
          next_review_date: nextReviewDate || undefined,
          status: assessmentStatus,
          overall_risk_score: calculateRiskDashboard().total_score,
          overall_risk_level: calculateRiskDashboard().overall_risk_level,
          conducted_by_name: existingAssessment?.assessment.conducted_by_name || userInfo?.name || 'Current User',
          reviewed_by_name: existingAssessment?.assessment.reviewed_by_name,
          approved_by_name: existingAssessment?.assessment.approved_by_name,
          rejected_by_name: existingAssessment?.assessment.rejected_by_name,
          created_at: existingAssessment?.assessment.created_at || new Date().toISOString(),
          updated_at: existingAssessment?.assessment.updated_at || new Date().toISOString()
        },
        riskData: riskData,
        sectionComments: sectionComments,
        riskMitigationPlans: riskMitigationPlans,
        riskDashboard: calculateRiskDashboard(),
        summaryCommentText: summaryCommentText
      };

      // Generate and download PDF
      PDFService.generateAssessmentReport(pdfData);
      
      showCustomAlert('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showCustomAlert('Failed to generate PDF report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveAssessment = async () => {
    if (!study || !userInfo) return;
    
    // Validate all risk scores (mandatory validation)
    const missingScores = validateAllRiskScores();
    if (missingScores.length > 0) {
      showValidationError(missingScores);
      return;
    }
    
    // Add unique operation ID to track this specific save operation
    const operationId = Date.now() + Math.random();
    console.log(`🚀 Starting save operation: ${operationId}`);
    
    // Check if user has filled in any risk mitigation plans
    const hasRiskMitigationPlans = riskMitigationPlans.some(plan => 
      plan.risk_item.trim() !== '' || 
      plan.responsible_person.trim() !== '' || 
      plan.mitigation_strategy.trim() !== ''
    );
    
    if (!hasRiskMitigationPlans) {
      alert('Please fill in at least one Risk Mitigation Plan before saving the assessment.');
      return;
    }
    
    console.log('Full study object:', study);
    console.log('Study data being used for save:', {
      study_id: study.study_id || study.id,
      study_id_type: typeof (study.study_id || study.id),
      protocol: study.protocol,
      site: study.site,
      sponsor: study.sponsor
    });
    
    // Use study_id if available, otherwise fall back to id
    const studyId = study.study_id || study.id;
    if (!studyId) {
      console.error('❌ Study ID is missing or undefined:', { study_id: study.study_id, id: study.id });
      setError('Study ID is missing. Please go back and select a study again.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare risk data for all sections
      const allRisks: any[] = [];
      let totalRiskScore = 0;
      let totalRisks = 0;
      let highRiskCount = 0;
      let mediumRiskCount = 0;
      let lowRiskCount = 0;
      
      Object.keys(riskData).forEach(sectionKey => {
        riskData[sectionKey].forEach(risk => {
          if (risk.severity && risk.likelihood) {
            const severity = parseInt(risk.severity);
            const likelihood = parseInt(risk.likelihood);
            const riskScore = severity * likelihood;
            totalRiskScore += riskScore;
            totalRisks++;
            
            if (riskScore >= 7) highRiskCount++;
            else if (riskScore >= 4) mediumRiskCount++;
            else lowRiskCount++;
            
            allRisks.push({
              risk_factor_id: risk.risk_factor_id,
              severity: severity,
              likelihood: likelihood,
              risk_score: riskScore,
              risk_level: getRiskLevel(riskScore),
              mitigation_actions: risk.mitigation || '',
              custom_notes: risk.custom_notes || ''
            });
          }
        });
      });

      console.log('Prepared risk scores:', allRisks);

      // Calculate overall risk level using the same logic as calculateRiskDashboard
      let overallRiskLevel = '';
      let riskLevelCriteria = '';
      
      if (totalRiskScore <= 15 && highRiskCount === 0) {
        overallRiskLevel = 'Low';
        riskLevelCriteria = 'Low Risk (Total Score ≤15, No High-Risk items)';
      } else if (totalRiskScore <= 30 && highRiskCount < 3) {
        overallRiskLevel = 'Medium';
        riskLevelCriteria = 'Medium Risk (Total Score 16-30, <3 High-Risk items)';
      } else {
        overallRiskLevel = 'High';
        riskLevelCriteria = 'High Risk (Total Score >30, ≥3 High-Risk items)';
      }

      // Determine user fields based on assessment status
      let reviewedByName: string | undefined;
      let reviewedByEmail: string | undefined;
      let approvedByName: string | undefined;
      let approvedByEmail: string | undefined;
      let rejectedByName: string | undefined;
      let rejectedByEmail: string | undefined;
      
      // Use existing assessment data if available, otherwise use current user
      const existingAssessmentData = existingAssessment?.assessment;
      const updatedByName = existingAssessmentData?.updated_by_name || userInfo?.name || userInfo?.username || '';
      const updatedByEmail = existingAssessmentData?.updated_by_email || userInfo?.username || '';
      
      if (assessmentStatus === 'Approved') {
        approvedByName = updatedByName;
        approvedByEmail = updatedByEmail;
        reviewedByName = updatedByName;
        reviewedByEmail = updatedByEmail;
      } else if (assessmentStatus === 'Rejected') {
        rejectedByName = updatedByName;
        rejectedByEmail = updatedByEmail;
        reviewedByName = updatedByName;
        reviewedByEmail = updatedByEmail;
      } else if (assessmentStatus === 'Pending Review' || assessmentStatus === 'In Progress') {
        // Don't set reviewed_by for pending or in progress status
      }
      
      const assessmentData: AssessmentCreate = {
        study_id: studyId,
        assessment_date: assessmentDate,
        next_review_date: nextReviewDate || null, // Send null instead of undefined
        monitoring_schedule: monitoring || '', // Ensure monitoring_schedule is not undefined
        overall_risk_score: totalRiskScore,
        overall_risk_level: overallRiskLevel,
        comments: '', // Keep empty for backward compatibility
        reviewed_by_name: reviewedByName,
        reviewed_by_email: reviewedByEmail,
        approved_by_name: approvedByName,
        approved_by_email: approvedByEmail,
        rejected_by_name: rejectedByName,
        rejected_by_email: rejectedByEmail,
        section_comments: Object.entries(sectionComments)
          .filter(([_, comment]) => comment.trim() !== '')
          .map(([sectionKey, commentText]) => ({
            section_key: sectionKey,
            section_title: metadata?.assessment_sections.find(s => s.section_key === sectionKey)?.section_title || sectionKey,
            comment_text: commentText
          })),
        risk_scores: allRisks,
        risk_mitigation_plans: riskMitigationPlans.filter(plan => 
          plan.risk_item.trim() !== '' || 
          plan.responsible_person.trim() !== '' || 
          plan.mitigation_strategy.trim() !== ''
        ),
        risk_dashboard: {
          total_risks: totalRisks,
          high_risk_count: highRiskCount,
          medium_risk_count: mediumRiskCount,
          low_risk_count: lowRiskCount,
          total_score: totalRiskScore,
          overall_risk_level: overallRiskLevel,
          risk_level_criteria: riskLevelCriteria
        },
        summary_comments: summaryCommentText.trim() ? [
          {
            comment_type: 'General',
            comment_text: summaryCommentText.trim()
          }
        ] : summaryComments.length > 0 ? summaryComments : [
          {
            comment_type: 'General',
            comment_text: 'Assessment completed successfully'
          }
        ]
      };

      console.log('Saving assessment data:', JSON.stringify(assessmentData, null, 2));
      console.log('📝 Section comments being saved:', assessmentData.section_comments);
      console.log('📝 Section comments count:', assessmentData.section_comments?.length || 0);
      console.log('📝 Section comments details:', assessmentData.section_comments?.map(sc => `${sc.section_key}: "${sc.comment_text.substring(0, 50)}..."`) || []);
      console.log('Risk scores array length:', assessmentData.risk_scores.length);
      console.log('Risk scores type:', typeof assessmentData.risk_scores);
      console.log('Risk scores is array:', Array.isArray(assessmentData.risk_scores));
      console.log('Risk mitigation plans:', riskMitigationPlans);
      console.log('Filtered risk mitigation plans:', assessmentData.risk_mitigation_plans);
      const plansWithData = riskMitigationPlans.filter(plan => 
        plan.risk_item.trim() !== '' || 
        plan.responsible_person.trim() !== '' || 
        plan.mitigation_strategy.trim() !== ''
      );
      console.log('Risk mitigation plans with data:', plansWithData);
      console.log('Number of risk mitigation plans to save:', plansWithData.length);
      
      const response = await AssessmentService.saveAssessment(assessmentData);
      console.log('Assessment saved successfully:', response);
      console.log('Response structure:', JSON.stringify(response, null, 2));
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      console.log('Response.assessment:', response?.assessment);
      console.log('Response.custom_assessment_id:', response?.custom_assessment_id);
      console.log('Response.assessment?.custom_assessment_id:', response?.assessment?.custom_assessment_id);
      console.log('Response.assessment?.id:', response?.assessment?.id);
      console.log('Response.id:', response?.id);
      console.log('Response.assessment_id:', response?.assessment_id);
      
      // Show success message
      const assessmentId = response?.custom_assessment_id || response?.assessment?.custom_assessment_id || response?.assessment_id || response?.assessment?.id || response?.id || 'N/A';
      console.log(`=== ASSESSMENT ID DEBUG (Operation: ${operationId}) ===`);
      console.log('Response object:', response);
      console.log('Response.assessment?.id:', response?.assessment?.id);
      console.log('Response.id:', response?.id);
      console.log('Response.assessment_id:', response?.assessment_id);
      console.log('Calculated assessmentId:', assessmentId);
      console.log('AssessmentId type:', typeof assessmentId);
      console.log('AssessmentId value:', assessmentId);
      
      console.log('Study protocol:', study.protocol);
      console.log('Total risks:', totalRisks);
      console.log('Total score:', totalRiskScore);
      console.log('Overall risk level:', overallRiskLevel);
      console.log('Plans count:', plansWithData.length);
      
      const successMessage = `Assessment saved successfully!
      
Study Protocol: ${study.protocol}
Assessment ID: ${assessmentId}
Total Risks: ${totalRisks}
Total Score: ${totalRiskScore}
Overall Risk Level: ${overallRiskLevel}`;
      
      console.log('Final success message:', successMessage);
      console.log('=== END ASSESSMENT ID DEBUG ===');
      
      // Double-check the assessment ID in the message
      const messageAssessmentId = successMessage.match(/Assessment ID: (\d+)/)?.[1];
      console.log('Extracted ID from message:', messageAssessmentId);
      console.log('Original assessmentId variable:', assessmentId);
      console.log('Are they the same?', messageAssessmentId === assessmentId?.toString());
      console.log(`✅ Save operation ${operationId} completed`);
      
      // Show custom styled alert
      showCustomAlert(successMessage);
      
      // Reset form or redirect
      // Don't clear section comments - they're now persistent
      
    } catch (err) {
      console.error('Error saving assessment:', err);
      setError('Failed to save assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="riskeval-container">
      {/* Authorization Banner */}
      {authorizationLoading ? (
        <div className="authorization-banner authorization-loading">
          <span className="banner-icon">⏳</span>
          <span className="banner-text">Checking user permissions...</span>
        </div>
      ) : authorizationError ? (
        <div className="authorization-banner authorization-error">
          <span className="banner-icon">❌</span>
          <span className="banner-text">Error checking permissions: {authorizationError}</span>
        </div>
      ) : !canEdit ? (
        <div className="authorization-banner authorization-view">
          <span className="banner-icon"><FiEye /></span>
          <span className="banner-text">
            You can only view this assessment.
            {userPermissions?.piEmail && userPermissions?.sdEmail && (
              <> Contact the Principal Investigator ({userPermissions.piEmail}) or Site Director ({userPermissions.sdEmail}) for edit access.</>
            )}
            {userPermissions?.reason && <> Reason: {userPermissions.reason}</>}
          </span>
        </div>
      ) : (
        <div className="authorization-banner authorization-edit">
          <span className="banner-icon"><FiEdit2 /></span>
          <span className="banner-text">You have edit permissions for this assessment.</span>
        </div>
      )}

      {existingAssessment && (
        <div className="existing-assessment-banner">
          <span className="banner-icon">📋</span>
          <span className="banner-text">
            Existing assessment data loaded from {existingAssessment.assessment.assessment_date}. 
            {canEdit ? ' You can modify and save changes.' : ' You can only view this assessment.'}
          </span>
        </div>
      )}
      <Expander title="Study Information" defaultExpanded>
        {(study || existingAssessment) ? (
          <>
            <div className="riskeval-info-grid">
              <div><span className="riskeval-label">Site</span><div>{study?.site || 'Loading...'}</div></div>
              <div><span className="riskeval-label">Sponsor</span><div>{study?.sponsor || 'Loading...'}</div></div>
              <div><span className="riskeval-label">Protocol</span><div>{study?.protocol || 'Loading...'}</div></div>
              <div><span className="riskeval-label">Study Type</span><div>{study?.study_type_text || study?.studytypetext || 'Loading...'}</div></div>
              <div><span className="riskeval-label">Description</span><div>{study?.description || 'Loading...'}</div></div>
              <div><span className="riskeval-label">Study Status</span><div>{study?.study_status || study?.status || 'Loading...'}</div></div>
              <div><span className="riskeval-label">Phase</span><div>{study?.phase || 'Loading...'}</div></div>
              <div><span className="riskeval-label">Monitoring Schedule</span>
                <select 
                  className="riskeval-dropdown" 
                  value={monitoring || ''} 
                  onChange={e => setMonitoring(e.target.value)}
                  disabled={!canEdit}
                >
                  {!study?.monitoring_schedule && <option value="">Select Status</option>}
                  {monitoringOptions.filter(opt => opt !== '').map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div><span className="riskeval-label">Assessment Date</span>
                <input
                  className="riskeval-date"
                  type="date"
                  value={assessmentDate}
                  onChange={e => setAssessmentDate(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div><span className="riskeval-label">Next Review Date</span>
                <input
                  className="riskeval-date"
                  type="date"
                  value={nextReviewDate}
                  onChange={e => setNextReviewDate(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div><span className="riskeval-label">Assessment Status</span>
                <select 
                  className="riskeval-dropdown" 
                  value={assessmentStatus} 
                  disabled
                  style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                >
                  <option value="Pending Review">Pending Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div><span className="riskeval-label">Conducted By</span><div>{existingAssessment?.assessment?.conducted_by_name || userInfo?.name || 'Current User'}</div></div>
              <div><span className="riskeval-label">Reviewed By</span>
                <div>
                  {assessmentStatus === 'Approved' || assessmentStatus === 'Rejected' 
                    ? existingAssessment?.assessment?.updated_by_name || userInfo?.name || 'Current User' 
                    : existingAssessment?.assessment?.reviewed_by_name || '-'}
                </div>
              </div>
              <div><span className="riskeval-label">Approved By</span>
                <div>
                  {assessmentStatus === 'Approved' 
                    ? existingAssessment?.assessment?.updated_by_name || userInfo?.name || 'Current User' 
                    : existingAssessment?.assessment?.approved_by_name || '-'}
                </div>
              </div>
              <div><span className="riskeval-label">Rejected By</span>
                <div>
                  {assessmentStatus === 'Rejected' 
                    ? existingAssessment?.assessment?.updated_by_name || userInfo?.name || 'Current User' 
                    : existingAssessment?.assessment?.rejected_by_name || '-'}
                </div>
              </div>
            </div>
            <div className="riskeval-download-row">
              <button 
                className="riskeval-download-btn" 
                type="button"
                onClick={handleDownloadPDF}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    Download Assessment <span className="riskeval-download-icon"><FiDownload /></span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="riskeval-no-data">No study selected.</div>
        )}
      </Expander>
      {(study || existingAssessment) && (
        <>
          <div className="riskeval-stepper">
            {(() => {
              console.log('🔍 Rendering stepper with steps:', steps);
              console.log('🔍 Current section:', section);
              return null;
            })()}
            {steps.map((step, idx) => {
              console.log(`🔍 Rendering step ${idx + 1}:`, step);
              const isCompleted = idx < steps.findIndex(s => s.key === section);
              const isCurrent = section === step.key;
              
              return (
                <div
                  key={step.key}
                  className={`riskeval-step${isCurrent ? ' active' : ''}${isCompleted ? ' completed' : ''}`}
                  onClick={() => setSection(step.key)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="riskeval-step-circle">
                    {isCompleted ? (
                      <span className="step-checkmark">✓</span>
                    ) : isCurrent ? (
                      <span className="step-dot"></span>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="riskeval-step-label">{step.label}</div>
                  {idx < steps.length - 1 && <div className="riskeval-step-line" />}
                </div>
              );
            })}
          </div>
          {section !== 'summary' ? (
            <Expander title={sectionData?.title || ''} defaultExpanded>
              {rows.length === 0 ? (
                <div className="riskeval-no-data" style={{ padding: '20px', textAlign: 'center' }}>
                  No risk factors available for this section.
                </div>
              ) : (
                <>
                  {/* Validation Summary Banner */}
                  {(() => {
                    const currentSectionRisks = riskData[section] || [];
                    const filledScores = currentSectionRisks.filter(risk => risk.severity && risk.likelihood).length;
                    const totalScores = currentSectionRisks.length;
                    const missingCount = totalScores - filledScores;
                    const completionPercentage = totalScores > 0 ? Math.round((filledScores / totalScores) * 100) : 0;
                    
                    if (totalScores > 0) {
                      return (
                        <div className="validation-summary-banner">
                          <span className="validation-summary-text">
                            Section Completion: {completionPercentage}% ({filledScores}/{totalScores} scores filled)
                            {missingCount > 0 && <span className="validation-summary-missing"> - {missingCount} scores missing</span>}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  <div className="riskeval-risk-table-wrapper">
                    <table className="riskeval-risk-table">
                      <thead>
                        <tr>
                          <th style={{ width: '20%' }}>Risk Factor</th>
                          <th style={{ width: '10%' }}>Severity (1-3)*</th>
                          <th style={{ width: '10%' }}>Likelihood (1-3)*</th>
                          <th style={{ width: '8%' }}>Score</th>
                          <th style={{ width: '10%' }}>Risk Level</th>
                          <th style={{ width: '20%' }}>Mitigation Actions</th>
                          <th style={{ width: '22%' }}>Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => {
                          const sev = row.severity ? Number(row.severity) : 0;
                          const lik = row.likelihood ? Number(row.likelihood) : 0;
                          const score = sev > 0 && lik > 0 ? sev * lik : 0;
                          const riskLevel = score > 0 ? getRiskLevel(score) : '-';
                          const riskLevelClass = score > 0 ? 
                            (score >= 7 ? 'risk-high' : score >= 4 ? 'risk-medium' : 'risk-low') : '';
                          const isHighRisk = score >= 7;
                          const needsMitigation = isHighRisk && !row.mitigation.trim();
                          
                          return (
                            <tr key={idx} className={needsMitigation ? 'mitigation-required' : ''}>
                              <td style={{ fontWeight: '500' }}>{row.risk_factor_text}</td>
                              <td>
                                <div className="riskeval-editable-cell">
                                  <input
                                    className={`riskeval-risk-input ${!row.severity ? 'required-field' : ''}`}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[1-3]"
                                    value={row.severity}
                                    onChange={e => handleInput(idx, 'severity', e.target.value)}
                                    placeholder="1-3"
                                    disabled={!canEdit}
                                    key={`severity-${idx}-${row.severity}`}
                                  />
                                  <FiEdit2 className="riskeval-edit-icon" />
                                </div>
                                {/* Debug info */}
                                {/* <div style={{ fontSize: '10px', color: '#999' }}>
                                  Debug: value="{row.severity}" (type: {typeof row.severity})
                                </div> */}
                              </td>
                              <td>
                                <div className="riskeval-editable-cell">
                                  <input
                                    className={`riskeval-risk-input ${!row.likelihood ? 'required-field' : ''}`}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[1-3]"
                                    value={row.likelihood}
                                    onChange={e => handleInput(idx, 'likelihood', e.target.value)}
                                    placeholder="1-3"
                                    disabled={!canEdit}
                                    key={`likelihood-${idx}-${row.likelihood}`}
                                  />
                                  <FiEdit2 className="riskeval-edit-icon" />
                                </div>
                                {/* Debug info */}
                                {/* <div style={{ fontSize: '10px', color: '#999' }}>
                                  Debug: value="{row.likelihood}" (type: {typeof row.likelihood})
                                </div> */}
                              </td>
                              <td style={{ fontWeight: '600', textAlign: 'center' }}>{score || '-'}</td>
                              <td>
                                <span className={`risk-level-badge ${riskLevelClass}`}>
                                  {riskLevel}
                                </span>
                              </td>
                              <td>
                                <input
                                  className={`riskeval-risk-mitigation ${needsMitigation ? 'high-risk-warning' : ''}`}
                                  type="text"
                                  value={row.mitigation}
                                  onChange={e => handleInput(idx, 'mitigation', e.target.value)}
                                  placeholder={isHighRisk ? "Mitigation required for high risk!" : "Enter mitigation actions..."}
                                  disabled={!canEdit}
                                />
                              </td>
                              <td>
                                <input
                                  className="riskeval-risk-mitigation"
                                  type="text"
                                  value={row.custom_notes}
                                  onChange={e => handleInput(idx, 'custom_notes', e.target.value)}
                                  placeholder="Enter comments..."
                                  disabled={!canEdit}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Section Summary */}
                  {sectionSummary.totalRisks > 0 && (
                    <div className="riskeval-section-summary">
                      <div className="riskeval-summary-stats">
                        <div className="riskeval-summary-stat">
                          <span className="riskeval-summary-label">Total Risks:</span>
                          <span className="riskeval-summary-value">{sectionSummary.totalRisks}</span>
                        </div>
                        <div className="riskeval-summary-stat">
                          <span className="riskeval-summary-label">High Risk:</span>
                          <span className="riskeval-summary-value risk-high">{sectionSummary.highRisks}</span>
                        </div>
                        <div className="riskeval-summary-stat">
                          <span className="riskeval-summary-label">Medium Risk:</span>
                          <span className="riskeval-summary-value risk-medium">{sectionSummary.mediumRisks}</span>
                        </div>
                        <div className="riskeval-summary-stat">
                          <span className="riskeval-summary-label">Low Risk:</span>
                          <span className="riskeval-summary-value risk-low">{sectionSummary.lowRisks}</span>
                        </div>
                        <div className="riskeval-summary-stat">
                          <span className="riskeval-summary-label">Total Score:</span>
                          <span className="riskeval-summary-value">{sectionSummary.totalScore}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="riskeval-comments-row">
                <label className="riskeval-comments-label">
                  Comments
                  {sectionComments[section] && (
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#28a745', fontWeight: 'normal' }}>
                      (Loaded from existing assessment)
                    </span>
                  )}
                </label>
                <textarea
                  className="riskeval-comments"
                  value={sectionComments[section] || ''}
                  onChange={e => setSectionComments(prev => ({ ...prev, [section]: e.target.value }))}
                  placeholder="Add comments here..."
                  disabled={!canEdit}
                  style={{
                    borderColor: sectionComments[section] ? '#28a745' : undefined,
                    backgroundColor: sectionComments[section] ? '#f8fff9' : undefined
                  }}
                />
              </div>
              <div className="riskeval-save-row">
                <button 
                  className="riskeval-save-btn" 
                  type="button" 
                  onClick={handleSaveAndProceed}
                  disabled={loading || !canEdit}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Loading Scores...
                    </>
                  ) : !canEdit ? (
                    'View Only Mode'
                  ) : (
                    section === 'site-operations' ? 'Save Assessment' : 'Save and Proceed'
                  )}
                </button>
              </div>
            </Expander>
          ) : (
            <>
              <Expander title="Risk Mitigation Plan- High Priority Actions" defaultExpanded>
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                  <p style={{ margin: '0', fontSize: '14px', color: '#6c757d' }}>
                    <strong>Note:</strong> Please fill in at least one risk mitigation plan below. Only plans with data will be saved to the database.
                  </p>
                </div>
                <div className="riskeval-summary-table-wrapper">
                  <table className="riskeval-summary-table">
                    <thead>
                      <tr>
                        <th>Risk Items</th>
                        <th>Responsible Person</th>
                        <th>Mitigation Strategy</th>
                        <th>Target Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riskMitigationPlans.map((plan, idx) => {
                        const hasData = plan.risk_item.trim() !== '' || 
                                       plan.responsible_person.trim() !== '' || 
                                       plan.mitigation_strategy.trim() !== '';
                        return (
                          <tr key={idx} style={{ 
                            backgroundColor: hasData ? 'rgba(212, 237, 218, 0.1)' : 'transparent',
                            borderLeft: hasData ? '3px solid #28a745' : 'none'
                          }}>
                          <td>
                            <input 
                              className="riskeval-summary-input" 
                              type="text" 
                              value={plan.risk_item}
                              onChange={e => {
                                const updatedPlans = [...riskMitigationPlans];
                                updatedPlans[idx] = { ...plan, risk_item: e.target.value };
                                setRiskMitigationPlans(updatedPlans);
                              }}
                              placeholder="Enter risk item..."
                              disabled={!canEdit}
                            />
                          </td>
                          <td>
                            <input 
                              className="riskeval-summary-input" 
                              type="text" 
                              value={plan.responsible_person}
                              onChange={e => {
                                const updatedPlans = [...riskMitigationPlans];
                                updatedPlans[idx] = { ...plan, responsible_person: e.target.value };
                                setRiskMitigationPlans(updatedPlans);
                              }}
                              placeholder="Enter responsible person..."
                              disabled={!canEdit}
                            />
                          </td>
                          <td>
                            <input 
                              className="riskeval-summary-input" 
                              type="text" 
                              value={plan.mitigation_strategy}
                              onChange={e => {
                                const updatedPlans = [...riskMitigationPlans];
                                updatedPlans[idx] = { ...plan, mitigation_strategy: e.target.value };
                                setRiskMitigationPlans(updatedPlans);
                              }}
                              placeholder="Enter mitigation strategy..."
                              disabled={!canEdit}
                            />
                          </td>
                          <td>
                            <input 
                              className="riskeval-summary-input" 
                              type="date" 
                              value={plan.target_date}
                              onChange={e => {
                                const updatedPlans = [...riskMitigationPlans];
                                updatedPlans[idx] = { ...plan, target_date: e.target.value };
                                setRiskMitigationPlans(updatedPlans);
                              }}
                              disabled={!canEdit}
                            />
                          </td>
                          <td>
                            <select 
                              className="riskeval-summary-input" 
                              value={plan.status}
                              onChange={e => {
                                const updatedPlans = [...riskMitigationPlans];
                                updatedPlans[idx] = { ...plan, status: e.target.value };
                                setRiskMitigationPlans(updatedPlans);
                              }}
                              disabled={!canEdit}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Overdue">Overdue</option>
                            </select>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ marginTop: '10px' }}>
                    <button 
                      type="button" 
                      onClick={addRiskMitigationPlan}
                      disabled={!canEdit}
                      style={{ 
                        background: canEdit ? 'var(--color-primary)' : '#ccc', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: '4px', 
                        cursor: canEdit ? 'pointer' : 'not-allowed' 
                      }}
                    >
                      {canEdit ? '+ Add Risk Mitigation Plan' : 'View Only Mode'}
                    </button>
                  </div>
                  {/* Preview of plans that will be saved */}
                  {getPlansWithData().length > 0 && (
                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '6px', border: '1px solid #c3e6cb' }}>
                      <p style={{ margin: '0', fontSize: '14px', color: '#155724', fontWeight: '500' }}>
                        ✅ {getPlansWithData().length} Risk Mitigation Plan{getPlansWithData().length > 1 ? 's' : ''} will be saved:
                      </p>
                      <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', fontSize: '13px', color: '#155724' }}>
                        {getPlansWithData().map((plan, idx) => (
                          <li key={idx}>
                            <strong>{plan.risk_item || 'Risk Item'}</strong> - {plan.responsible_person || 'Responsible Person'} 
                            {plan.mitigation_strategy && ` - ${plan.mitigation_strategy}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Expander>
              <Expander title="Risk Dashboard Dashboard" defaultExpanded>
                <div className="riskeval-summary-table-wrapper">
                  <table className="riskeval-summary-table">
                    <thead>
                      <tr>
                        <th>Total Risks</th>
                        <th>High Risk (7-9)</th>
                        <th>Medium Risk (3-6)</th>
                        <th>Low Risk (1-2)</th>
                        <th>Total Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><input className="riskeval-summary-input" type="text" value={calculateRiskDashboard().total_risks} readOnly style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }} /></td>
                        <td><input className="riskeval-summary-input" type="text" value={calculateRiskDashboard().high_risk_count} readOnly style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }} /></td>
                        <td><input className="riskeval-summary-input" type="text" value={calculateRiskDashboard().medium_risk_count} readOnly style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }} /></td>
                        <td><input className="riskeval-summary-input" type="text" value={calculateRiskDashboard().low_risk_count} readOnly style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }} /></td>
                        <td><input className="riskeval-summary-input" type="text" value={calculateRiskDashboard().total_score} readOnly style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="riskeval-summary-risklevel">
                  <div className="riskeval-summary-risklevel-title">Overall Study Risk Level:</div>
                  <label className="riskeval-summary-checkbox">
                    <input type="checkbox" checked={getRiskLevelCheckboxState().lowRisk} readOnly />
                    Low Risk (Total Score ≤15, No High-Risk items)
                  </label>
                  <label className="riskeval-summary-checkbox">
                    <input type="checkbox" checked={getRiskLevelCheckboxState().mediumRisk} readOnly />
                    Medium Risk (Total Score 16-30, &lt;3 High-Risk items)
                  </label>
                  <label className="riskeval-summary-checkbox">
                    <input type="checkbox" checked={getRiskLevelCheckboxState().highRisk} readOnly />
                    High Risk (Total Score &gt;30, ≥3 High-Risk items)
                  </label>
                </div>
                <div className="riskeval-comments-row">
                  <label className="riskeval-comments-label">Comments</label>
                  <textarea 
                    className="riskeval-comments" 
                    value={summaryCommentText}
                    onChange={e => setSummaryCommentText(e.target.value)}
                    placeholder="Add final assessment comments here..." 
                    disabled={!canEdit}
                  />
                </div>
                <div className="riskeval-summary-save-row">
                  {/* <button 
                    className="riskeval-save-btn" 
                    type="button"
                    disabled={!canEdit}
                  >
                    {canEdit ? 'Save' : 'View Only Mode'}
                  </button> */}
                  <button 
                    className="riskeval-save-btn" 
                    type="button" 
                    onClick={saveAssessment}
                    disabled={loading || !canEdit}
                  >
                    {loading ? 'Loading Scores...' : canEdit ? 'Submit Assessment' : 'View Only Mode'}
                  </button>
                </div>
              </Expander>
            </>
          )}
        </>
      )}
      
      {/* Debug section comments */}
      {console.log('🔍 Current section comments state:', sectionComments)}
      {console.log('🔍 Current section:', section)}
      {console.log('🔍 Comment for current section:', sectionComments[section])}
    </div>
  );
};

export default RiskEvaluation; 