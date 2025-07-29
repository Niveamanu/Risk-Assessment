// Mock data for the Risk Assessment application

// Study data used across multiple components
export const mockStudies = [
  {
    site: 'Flourish San Antonio',
    sponsor: 'CinFina Pharma',
    protocol: 'CIN-110-112',
    studyType: 'Pulmonology',
    studyStatus: 'Enrolling',
    description: 'Severe and Persistent Asthma',
    phase: '1',
    monitoring: 'Quarterly Review',
    assessmentStatus: 'Not Started',
  },
  {
    site: 'Flourish Orlando AstraZeneca',
    sponsor: 'AstraZeneca',
    protocol: 'D7650C000001',
    studyType: 'Future Studies',
    studyStatus: 'Study Completed',
    description: 'Chronic Obstructive Pulmonary Disease',
    phase: '3',
    monitoring: 'Final Review',
    assessmentStatus: 'Approved',
  },
  {
    site: 'Flourish Boca Ration',
    sponsor: 'Boehringer Ingelrim',
    protocol: '14-4-0056',
    studyType: 'Cardiology',
    studyStatus: 'Active',
    description: 'Heart Failure Study',
    phase: '2',
    monitoring: 'Monthly Review',
    assessmentStatus: 'In Progress',
  },
  {
    site: 'Flourish San Antonio',
    sponsor: 'CinFina Pharma',
    protocol: 'CIN-110-113',
    studyType: 'Pulmonology',
    studyStatus: 'Planning',
    description: 'Moderate Asthma Treatment',
    phase: '2',
    monitoring: 'Monthly Review',
    assessmentStatus: 'Not Started',
  },
  {
    site: 'Flourish Orlando AstraZeneca',
    sponsor: 'AstraZeneca',
    protocol: 'D7650C000002',
    studyType: 'Oncology',
    studyStatus: 'Enrolling',
    description: 'Lung Cancer Treatment',
    phase: '3',
    monitoring: 'Quarterly Review',
    assessmentStatus: 'In Progress',
  },
  {
    site: 'Flourish Boca Ration',
    sponsor: 'Boehringer Ingelrim',
    protocol: '14-4-0057',
    studyType: 'Cardiology',
    studyStatus: 'Completed',
    description: 'Hypertension Study',
    phase: '4',
    monitoring: 'Final Review',
    assessmentStatus: 'Completed',
  },
  {
    site: 'Flourish Miami',
    sponsor: 'Pfizer',
    protocol: 'PF-2024-001',
    studyType: 'Neurology',
    studyStatus: 'Active',
    description: 'Alzheimer\'s Treatment',
    phase: '2',
    monitoring: 'Monthly Review',
    assessmentStatus: 'Not Started',
  },
  {
    site: 'Flourish Miami',
    sponsor: 'Pfizer',
    protocol: 'PF-2024-002',
    studyType: 'Neurology',
    studyStatus: 'Planning',
    description: 'Parkinson\'s Disease Study',
    phase: '1',
    monitoring: 'Quarterly Review',
    assessmentStatus: 'Not Started',
  },
];

// Cascading dropdown data - simulates the relationship between sites, sponsors, and protocols
export const cascadingDropdownData = {
  // All available sites
  sites: [
    'Flourish San Antonio',
    'Flourish Orlando AstraZeneca',
    'Flourish Boca Ration',
    'Flourish Miami'
  ],
  
  // Sponsors by site
  sponsorsBySite: {
    'Flourish San Antonio': ['CinFina Pharma'],
    'Flourish Orlando AstraZeneca': ['AstraZeneca'],
    'Flourish Boca Ration': ['Boehringer Ingelrim'],
    'Flourish Miami': ['Pfizer']
  },
  
  // Protocols by site and sponsor
  protocolsBySiteAndSponsor: {
    'Flourish San Antonio': {
      'CinFina Pharma': ['CIN-110-112', 'CIN-110-113']
    },
    'Flourish Orlando AstraZeneca': {
      'AstraZeneca': ['D7650C000001', 'D7650C000002']
    },
    'Flourish Boca Ration': {
      'Boehringer Ingelrim': ['14-4-0056', '14-4-0057']
    },
    'Flourish Miami': {
      'Pfizer': ['PF-2024-001', 'PF-2024-002']
    }
  }
};

// Sample Risk Assessment Data with realistic comments and mitigation plans
export const sampleRiskAssessmentData = {
  regulatory: {
    title: '1. Regulatory & Compliance Risks',
    sectionComments: 'Overall regulatory compliance is satisfactory. Site has established GCP training programs and maintains up-to-date regulatory documentation. Minor improvements needed in informed consent process documentation.',
    risks: [
      {
        risk: 'Non-Compliance with GCP Guidelines',
        severity: 3,
        likelihood: 2,
        score: 6,
        riskLevel: 'Medium',
        mitigation: 'Implement comprehensive GCP training program for all study staff. Establish regular compliance audits and monitoring visits. Create standardized operating procedures (SOPs) for all study activities. Assign dedicated compliance officer to oversee adherence.',
        comments: 'Site has basic GCP training but needs refresher courses. Previous audit identified minor documentation gaps that have been addressed. Staff turnover requires ongoing training reinforcement.'
      },
      {
        risk: 'Inadequate informed-consent process',
        severity: 3,
        likelihood: 1,
        score: 3,
        riskLevel: 'Low',
        mitigation: 'Develop standardized informed consent templates. Implement mandatory training for all staff involved in consent process. Establish consent verification procedures with independent witness requirement. Regular audits of consent documentation.',
        comments: 'Current consent process is adequate but could be more robust. Need to ensure all staff are properly trained on latest consent requirements. Consider implementing electronic consent system for better documentation.'
      },
      {
        risk: 'Protocol deviations',
        severity: 2,
        likelihood: 3,
        score: 6,
        riskLevel: 'Medium',
        mitigation: 'Establish protocol deviation reporting system with immediate notification requirements. Implement protocol training for all study staff. Create deviation prevention checklist. Regular protocol review meetings with study team.',
        comments: 'Minor protocol deviations have occurred in past studies, primarily due to timing issues. Need better systems for tracking and preventing deviations. Consider implementing automated reminders for critical protocol requirements.'
      }
    ]
  },
  dataQuality: {
    title: '2. Data Quality & Management Risks',
    sectionComments: 'Data quality systems are well-established but require ongoing monitoring. Electronic data capture system is reliable but backup procedures need enhancement. Staff training on data entry standards is current.',
    risks: [
      {
        risk: 'Incomplete or missing data',
        severity: 3,
        likelihood: 2,
        score: 6,
        riskLevel: 'Medium',
        mitigation: 'Implement mandatory data completeness checks before submission. Establish data validation rules in EDC system. Create data entry training program with competency assessments. Regular data quality audits with immediate correction procedures.',
        comments: 'Occasional missing data points identified during monitoring visits. Primary issue is with optional fields not being completed. Need to clarify which fields are truly optional vs. required.'
      },
      {
        risk: 'Data-entry errors',
        severity: 2,
        likelihood: 3,
        score: 6,
        riskLevel: 'Medium',
        mitigation: 'Implement double-data entry system for critical variables. Establish data validation rules and range checks. Create data entry training with regular competency assessments. Implement automated error detection and correction procedures.',
        comments: 'Data entry errors are infrequent but can impact study results. Most errors occur with numerical values and dates. Need to implement better validation at point of entry.'
      },
      {
        risk: 'System downtime/technical failures',
        severity: 3,
        likelihood: 1,
        score: 3,
        riskLevel: 'Low',
        mitigation: 'Establish redundant data backup systems with cloud storage. Implement disaster recovery procedures with regular testing. Create offline data collection procedures for emergency situations. Establish IT support contracts with guaranteed response times.',
        comments: 'System reliability has been excellent with minimal downtime. Current backup procedures are adequate but could be enhanced with real-time synchronization. IT support response time is within acceptable limits.'
      }
    ]
  },
  patientSafety: {
    title: '3. Patient Safety & Recruitment Risks',
    sectionComments: 'Patient safety protocols are comprehensive and well-implemented. Recruitment strategies are effective but could be enhanced. Safety monitoring systems are robust with good reporting procedures.',
    risks: [
      {
        risk: 'Adverse event under-reporting',
        severity: 3,
        likelihood: 2,
        score: 6,
        riskLevel: 'Medium',
        mitigation: 'Implement mandatory adverse event reporting training for all staff. Establish 24/7 safety reporting hotline. Create automated adverse event detection systems. Regular safety monitoring audits with immediate reporting requirements.',
        comments: 'Adverse event reporting has been timely and complete in previous studies. Staff are well-trained on reporting requirements. Consider implementing automated alerts for potential safety signals.'
      },
      {
        risk: 'Low patient recruitment/retention',
        severity: 2,
        likelihood: 3,
        score: 6,
        riskLevel: 'Medium',
        mitigation: 'Develop comprehensive recruitment strategy with multiple outreach methods. Implement patient retention programs with regular follow-up. Establish patient support services and transportation assistance. Create recruitment tracking system with regular progress reviews.',
        comments: 'Recruitment has been on target for most studies. Retention rates are good but could be improved with better patient support services. Consider implementing patient advisory board for feedback.'
      },
      {
        risk: 'Inadequate safety monitoring',
        severity: 3,
        likelihood: 1,
        score: 3,
        riskLevel: 'Low',
        mitigation: 'Establish dedicated safety monitoring team with 24/7 availability. Implement automated safety signal detection systems. Create comprehensive safety monitoring SOPs. Regular safety committee meetings with immediate action protocols.',
        comments: 'Safety monitoring systems are well-established and effective. Staff are properly trained on safety procedures. Monitoring frequency and procedures are appropriate for study type.'
      }
    ]
  },
  compliance: {
    title: '4. Patient Compliance & Recruitment Risks',
    sectionComments: 'Patient compliance has been generally good but requires ongoing attention. Visit adherence is satisfactory but could be improved with better scheduling flexibility. Patient education programs are effective.',
    risks: [
      {
        risk: 'Poor adherence to visit schedule',
        severity: 2,
        likelihood: 3,
        score: 6,
        riskLevel: 'Medium',
        mitigation: 'Implement flexible scheduling system with evening and weekend appointments. Establish patient reminder system with multiple contact methods. Create patient education programs on study importance. Provide transportation assistance for eligible patients.',
        comments: 'Visit adherence is generally good but some patients struggle with rigid scheduling. Need more flexible appointment options. Patient reminder system has been effective.'
      },
      {
        risk: 'High patient dropout/withdrawal rates',
        severity: 3,
        likelihood: 2,
        score: 6,
        riskLevel: 'Medium',
        mitigation: 'Implement comprehensive patient support programs. Establish regular patient check-ins and support calls. Create patient education materials on study benefits. Provide financial assistance for study-related expenses when appropriate.',
        comments: 'Dropout rates have been within acceptable limits but could be reduced with better support services. Primary reasons for dropout are logistical challenges and personal circumstances.'
      },
      {
        risk: 'Non-compliance with study procedures',
        severity: 2,
        likelihood: 2,
        score: 4,
        riskLevel: 'Low',
        mitigation: 'Develop comprehensive patient education programs with multiple formats. Implement regular compliance monitoring and feedback. Create simplified study procedures where possible. Establish patient support hotline for questions and concerns.',
        comments: 'Patient compliance with study procedures has been good. Education materials are clear and well-received. Need to ensure procedures are as simple as possible for patients.'
      },
      {
        risk: 'Inadequate patient follow-up tracking',
        severity: 2,
        likelihood: 3,
        score: 6,
        riskLevel: 'Medium',
        mitigation: 'Implement comprehensive follow-up tracking system with multiple contact methods. Establish automated follow-up reminders and tracking. Create patient engagement programs to maintain contact. Regular follow-up protocol reviews and updates.',
        comments: 'Follow-up tracking systems are adequate but could be more robust. Need better integration between different tracking systems. Patient engagement has been good.'
      },
      {
        risk: 'Transportation/accessibility barriers',
        severity: 2,
        likelihood: 3,
        score: 6,
        riskLevel: 'Medium',
        mitigation: 'Establish transportation assistance program for eligible patients. Implement telehealth options where appropriate. Create flexible appointment scheduling. Partner with local transportation services for discounted rates.',
        comments: 'Transportation barriers are a common issue for some patients. Current assistance programs are helpful but could be expanded. Telehealth options have been well-received.'
      }
    ]
  },
  siteOperations: {
    title: '5. Site Operations & Resource Risks',
    sectionComments: 'Site operations are well-managed with good resource allocation. Staff training programs are comprehensive and current. Equipment and facilities are adequate for study requirements.',
    risks: [
      {
        risk: 'Insufficient staff training',
        severity: 2,
        likelihood: 1,
        score: 2,
        riskLevel: 'Low',
        mitigation: 'Implement comprehensive training program for all study staff. Establish competency assessments with regular re-evaluation. Create training tracking system with certification requirements. Regular training updates based on protocol changes.',
        comments: 'Staff training programs are comprehensive and current. All staff have completed required training. Competency assessments are conducted regularly and results are satisfactory.'
      },
      {
        risk: 'Key personnel turnover',
        severity: 3,
        likelihood: 2,
        score: 6,
        riskLevel: 'Medium',
        mitigation: 'Implement staff retention programs with competitive compensation. Establish knowledge transfer procedures for departing staff. Create backup personnel training for critical roles. Regular staff satisfaction surveys and improvement programs.',
        comments: 'Staff turnover has been minimal and manageable. Key personnel have been stable. Knowledge transfer procedures are in place and effective.'
      },
      {
        risk: 'Resource availability constraints',
        severity: 2,
        likelihood: 3,
        score: 6,
        riskLevel: 'Medium',
        mitigation: 'Establish resource planning and allocation system. Implement equipment maintenance and replacement schedules. Create backup resource agreements with other sites. Regular resource audits and capacity planning.',
        comments: 'Resource availability has been adequate for current study load. Equipment is well-maintained and functional. Capacity planning is ongoing and effective.'
      }
    ]
  }
};

// Sample Summary Comments for different assessment types
export const sampleSummaryComments = {
  overallAssessment: 'This site demonstrates strong capabilities for conducting clinical research with established quality systems and experienced staff. The overall risk assessment indicates a medium risk level primarily due to protocol deviation potential and data quality considerations. Mitigation strategies are well-defined and implementation is progressing satisfactorily. The site is recommended for continued participation in clinical trials with ongoing monitoring and support.',
  
  regulatoryCompliance: 'Regulatory compliance systems are well-established with comprehensive GCP training programs. Minor improvements needed in informed consent documentation and protocol deviation tracking. Overall compliance risk is manageable with current mitigation strategies.',
  
  dataQuality: 'Data quality systems are robust with good validation procedures. Electronic data capture is reliable with adequate backup systems. Ongoing training and monitoring are essential to maintain quality standards.',
  
  patientSafety: 'Patient safety protocols are comprehensive and well-implemented. Adverse event reporting systems are effective with good staff training. Safety monitoring procedures are appropriate for study requirements.',
  
  patientCompliance: 'Patient compliance has been generally good with effective support programs in place. Visit adherence is satisfactory but could be improved with more flexible scheduling. Patient education and support services are well-received.',
  
  siteOperations: 'Site operations are well-managed with adequate resources and trained staff. Equipment and facilities meet study requirements. Staff retention and training programs are effective.',
  
  recommendations: [
    'Continue with current mitigation strategies for protocol deviation prevention',
    'Enhance data quality monitoring with additional validation checks',
    'Implement more flexible patient scheduling options',
    'Expand patient support services to improve retention',
    'Maintain current staff training and retention programs',
    'Consider implementing electronic consent system for better documentation'
  ],
  
  nextReviewDate: '2024-07-15',
  monitoringSchedule: 'Quarterly review with monthly check-ins for high-risk areas'
};

// Dashboard statistics
export const dashboardStats = {
  cards: [
    { label: 'Total Active Sites', count: 4, color: '#a99cff' },
    { label: 'Total Active Studies', count: 50, color: '#ffd966' },
    { label: 'Total Assessed Studies', count: 25, color: '#b6f5d8' },
    { label: 'Total Approved Assessments', count: 15, color: '#b6e0fc' },
    { label: 'Total Rejected Assessments', count: 5, color: '#ffd6b6' },
    { label: 'Total Reviews Pending', count: 5, color: '#b6c7f5' },
  ],
  barChartData: [
    { label: 'Sponsor Protocol 1', value: 25, color: '#7c6ee6' },
    { label: 'Sponsor Protocol 2', value: 38, color: '#4ed6fa' },
    { label: 'Sponsor Protocol 3', value: 55, color: '#ffb43a' },
    { label: 'Sponsor Protocol 4', value: 20, color: '#ff6b81' },
  ],
  riskTableData: [
    { 
      study_id: 1,
      site: 'Flourish Boca Ration', 
      sponsor: 'Boehringer Ingelrim', 
      protocol: '14-4-0056', 
      risk: 17,
      assessment_id: 81,
      study_type: '1',
      study_type_text: 'Interventional',
      description: 'Clinical trial for cardiovascular disease',
      study_status: 'Active',
      phase: 'Phase 3',
      monitoring_schedule: 'Quarterly review',
      siteid: 1,
      studyid: '14-4-0056',
      active: true,
      principal_investigator: 'Dr. John Smith',
      principal_investigator_email: 'john.smith@flourish.com',
      site_director: 'Dr. Sarah Johnson',
      site_director_email: 'sarah.johnson@flourish.com',
      assessment_status: 'Completed',
      sponsor_code: 'BI001',
      created_at: '2024-01-15'
    },
    { 
      study_id: 2,
      site: 'Flourish San Antonio', 
      sponsor: 'CinFina Pharma', 
      protocol: 'CIN-110-112', 
      risk: 24,
      assessment_id: 82,
      study_type: '2',
      study_type_text: 'Observational',
      description: 'Oncology clinical trial',
      study_status: 'Active',
      phase: 'Phase 2',
      monitoring_schedule: 'Monthly review',
      siteid: 2,
      studyid: 'CIN-110-112',
      active: true,
      principal_investigator: 'Dr. Maria Garcia',
      principal_investigator_email: 'maria.garcia@flourish.com',
      site_director: 'Dr. Robert Chen',
      site_director_email: 'robert.chen@flourish.com',
      assessment_status: 'In Progress',
      sponsor_code: 'CP002',
      created_at: '2024-02-20'
    },
    { 
      study_id: 3,
      site: 'Flourish Orlando', 
      sponsor: 'AstraZeneca', 
      protocol: 'D7650C000001', 
      risk: 32,
      assessment_id: 83,
      study_type: '1',
      study_type_text: 'Interventional',
      description: 'Respiratory disease study',
      study_status: 'Active',
      phase: 'Phase 4',
      monitoring_schedule: 'Bi-weekly review',
      siteid: 3,
      studyid: 'D7650C000001',
      active: true,
      principal_investigator: 'Dr. Lisa Brown',
      principal_investigator_email: 'lisa.brown@flourish.com',
      site_director: 'Dr. Michael Wilson',
      site_director_email: 'michael.wilson@flourish.com',
      assessment_status: 'Completed',
      sponsor_code: 'AZ003',
      created_at: '2024-03-10'
    },
  ],
};

// Fallback data for paginated risk table
export const paginatedRiskTableFallback = {
  riskTableData: dashboardStats.riskTableData,
  totalStudies: 3,
  totalPages: 1,
  currentPage: 1,
  pageSize: 20
};

// Fallback data for risk table filter values
export const riskTableFilterValuesFallback = {
  sites: ['Flourish Boca Ration', 'Flourish San Antonio', 'Flourish Orlando', 'Flourish Miami'],
  sponsors: ['Boehringer Ingelrim', 'CinFina Pharma', 'AstraZeneca', 'Pfizer'],
  protocols: ['14-4-0056', 'CIN-110-112', 'D7650C000001', 'PF-2024-001']
};

// Search placeholders for different components
export const searchPlaceholders = {
  studyList: [
    'Search by Site',
    'Search by Sponsor',
    'Search by Protocol',
    'Search by Description',
  ],
  assessedStudies: [
    'Search by Protocol',
    'Search by Site',
    'Search by Sponsor',
    'Search by Study Type',
  ],
};

// Risk evaluation data
export const riskEvaluationData = {
  monitoringOptions: [
    'Initial assessment',
    'Quarterly review',
    'Amendment review',
    'Final assessment',
  ],
  steps: [
    { key: 'regulatory', label: 'Regulatory' },
    { key: 'data-quality', label: 'Data Quality' },
    { key: 'patient-safety', label: 'Patient Safety' },
    { key: 'compliance', label: 'Compliance' },
    { key: 'site-operations', label: 'Site Operations' },
    { key: 'summary', label: 'Summary' },
  ],
  riskSectionData: {
    'regulatory': {
      title: '1. Regulatory & Compliance Risks',
      risks: [
        { risk: 'Non -Compliance with GCP Guidelines' },
        { risk: 'Inadequate informed-consent process' },
        { risk: 'Protocol deviations' },
      ],
    },
    'data-quality': {
      title: '2. Data Quality & Management Risks',
      risks: [
        { risk: 'Incomplete or missing data' },
        { risk: 'Data-entry errors' },
        { risk: 'System downtime/technical failures' },
      ],
    },
    'patient-safety': {
      title: '3. Patient Safety & Recruitment Risks',
      risks: [
        { risk: 'Adverse event under-reporting' },
        { risk: 'Low patient recruitment/retention' },
        { risk: 'Inadequate safety monitoring' },
      ],
    },
    'compliance': {
      title: '4. Patient Compliance & Recruitment Risks',
      risks: [
        { risk: 'Poor adherence to visit schedule' },
        { risk: 'High patient dropout/withdrawal rates' },
        { risk: 'Non-compliance with study procedures' },
        { risk: 'Inadequate patient follow-up tracking' },
        { risk: 'Transportation/accessibility barriers' },
      ],
    },
    'site-operations': {
      title: '5. Site Operations & Resource Risks',
      risks: [
        { risk: 'Insufficient staff training' },
        { risk: 'key personnel turnover' },
        { risk: 'Resource availability constraints' },
      ],
    },
  },
};

// Assessment audit data
export const assessmentAuditData = [
  {
    timestamp: '2024-04-16 11:02 AM',
    riskFactor: 'Non-Compliance with GCP Guidelines',
    field: 'Severity',
    oldValue: '24',
    newValue: '32',
    changedBy: 'Jane Doe', 
  } 
];

// Assessment timeline data
export const assessmentTimelineData = [
  {
    id: 1,
    schedule: 'Monitoring Schedule',
    assessedDate: '2024-01-10',
    assessedBy: 'Dr. Smith',
    riskScore: 24,
    riskLevel: 'Low',
    notes: 'Initial Screening Complete',
  },
  
];

// Utility functions
export const getCurrentDate = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

export const getRiskLevel = (score: number) => {
  if (score >= 7) return 'High';
  if (score >= 4) return 'Medium';
  if (score >= 1) return 'Low';
  return '-';
}; 