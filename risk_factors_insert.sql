-- Risk Factors INSERT Script for RDS Database
-- Execute this script to populate the risk_factors table

INSERT INTO risk_factors (id, assessment_section_id, risk_factor_text, risk_factor_code, description, is_active, created_at) VALUES
(1, 1, 'Non-Compliance with GCP Guidelines', 'GCP_NON_COMPLIANCE', 'Failure to follow Good Clinical Practice guidelines and standards', true, '2025-07-12 18:20:14.075'),
(2, 1, 'Inadequate informed-consent process', 'INFORMED_CONSENT_ISSUES', 'Problems with the informed consent process or documentation', true, '2025-07-12 18:20:14.075'),
(3, 1, 'Protocol deviations', 'PROTOCOL_DEVIATIONS', 'Deviations from approved study protocol procedures', true, '2025-07-12 18:20:14.075'),
(4, 2, 'Incomplete or missing data', 'MISSING_DATA', 'Required data points not collected or recorded properly', true, '2025-07-12 18:20:14.075'),
(5, 2, 'Data-entry errors', 'DATA_ENTRY_ERRORS', 'Incorrect or inconsistent data entry by study staff', true, '2025-07-12 18:20:14.075'),
(6, 2, 'System downtime/technical failures', 'SYSTEM_DOWNTIME', 'Technical issues affecting data collection or management systems', true, '2025-07-12 18:20:14.075'),
(7, 3, 'Adverse event under-reporting', 'AE_UNDER_REPORTING', 'Failure to properly report or document adverse events', true, '2025-07-12 18:20:14.075'),
(8, 3, 'Low patient recruitment/retention', 'LOW_RECRUITMENT', 'Difficulty in recruiting or retaining study participants', true, '2025-07-12 18:20:14.075'),
(9, 3, 'Inadequate safety monitoring', 'SAFETY_MONITORING', 'Insufficient monitoring of patient safety during the study', true, '2025-07-12 18:20:14.075'),
(10, 4, 'Poor adherence to visit schedule', 'VISIT_ADHERENCE', 'Patients not following scheduled visit timelines', true, '2025-07-12 18:20:14.075'),
(11, 4, 'High patient dropout/withdrawal rates', 'PATIENT_DROPOUT', 'High rates of patient withdrawal from the study', true, '2025-07-12 18:20:14.075'),
(12, 4, 'Non-compliance with study procedures', 'PROCEDURE_NON_COMPLIANCE', 'Patients not following required study procedures', true, '2025-07-12 18:20:14.075'),
(13, 4, 'Inadequate patient follow-up tracking', 'FOLLOW_UP_TRACKING', 'Poor tracking of patient follow-up activities', true, '2025-07-12 18:20:14.075'),
(14, 4, 'Transportation/accessibility barriers', 'ACCESSIBILITY_BARRIERS', 'Physical or logistical barriers affecting patient participation', true, '2025-07-12 18:20:14.075'),
(15, 5, 'Insufficient staff training', 'STAFF_TRAINING', 'Inadequate training of study staff on protocols and procedures', true, '2025-07-12 18:20:14.075'),
(16, 5, 'Key personnel turnover', 'PERSONNEL_TURNOVER', 'High turnover of key study personnel affecting continuity', true, '2025-07-12 18:20:14.075'),
(17, 5, 'Resource availability constraints', 'RESOURCE_CONSTRAINTS', 'Limited availability of necessary resources for study conduct', true, '2025-07-12 18:20:14.075');

-- Optional: Add a comment to track the insertion
-- INSERTED: 17 risk factors across 5 assessment sections
-- Date: 2025-01-15
-- Purpose: Populate risk factors for clinical study risk assessment system 