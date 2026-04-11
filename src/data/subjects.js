export const SUBS=[
  {id:'fr',name:'Financial Reporting',code:'Paper 1',group:1,color:'fr',sections:[
    {title:'Framework',items:['Framework for Preparation & Presentation of Financial Statements']},
    {title:'Ind AS Standards',items:[
      'Ind AS 1 — Presentation of Financial Statements','Ind AS 2 — Inventories','Ind AS 7 — Statement of Cash Flows',
      'Ind AS 8 — Accounting Policies, Changes & Errors','Ind AS 10 — Events after Reporting Period','Ind AS 12 — Income Taxes',
      'Ind AS 16 — Property, Plant & Equipment','Ind AS 19 — Employee Benefits','Ind AS 20 — Government Grants',
      'Ind AS 21 — Effects of Changes in FX Rates','Ind AS 23 — Borrowing Costs','Ind AS 24 — Related Party Disclosures',
      'Ind AS 27 — Separate Financial Statements','Ind AS 28 — Investment in Associates & JVs','Ind AS 32 — Financial Instruments (Presentation)',
      'Ind AS 33 — Earnings Per Share','Ind AS 34 — Interim Financial Reporting','Ind AS 36 — Impairment of Assets',
      'Ind AS 37 — Provisions & Contingencies','Ind AS 38 — Intangible Assets','Ind AS 40 — Investment Property','Ind AS 41 — Agriculture'
    ]},
    {title:'Core Areas',items:[
      'Ind AS 103 — Business Combinations','Ind AS 110 — Consolidated Financial Statements','Ind AS 111 — Joint Arrangements',
      'Ind AS 113 — Fair Value Measurement','Ind AS 115 — Revenue from Contracts','Ind AS 116 — Leases','Ind AS 109 — Financial Instruments'
    ]},
    {title:'Other Topics',items:['Corporate Financial Statements (Schedule III)','Value Added Statement & EVA','Integrated Reporting']}
  ]},
  {id:'afm',name:'Advanced Financial Management',code:'Paper 2',group:1,color:'afm',sections:[
    {title:'All Chapters',items:[
      'Financial Policy & Corporate Strategy','Risk Management & Derivatives (Forwards, Futures, Options, Swaps)',
      'Forex Risk Management','Interest Rate Risk Management','Security Analysis','Portfolio Management',
      'Mutual Funds','International Financial Management','Alternative Investments (PE, Venture Capital)'
    ]}
  ]},
  {id:'aud',name:'Advanced Auditing & Assurance',code:'Paper 3',group:1,color:'aud',sections:[
    {title:'All Chapters',items:[
      'Auditing Standards (SA 200–720 series)','Audit Planning, Strategy & Execution','Risk Assessment & Internal Control',
      'Audit Evidence','Completion & Review','Audit Reports & CARO','Audit of Items of Financial Statements',
      'Audit of Group Financial Statements','Special Audits (Banks, Insurance, PSU)','Professional Ethics & Liability of Auditor',
      'Peer Review & Quality Review'
    ]}
  ]},
  {id:'dt',name:'Direct Tax Laws & International Taxation',code:'Paper 4',group:2,color:'dt',sections:[
    {title:'Core Income Tax',items:[
      'Basic Concepts & Definitions','Residential Status','Income under Salary','Income from House Property',
      'Profits & Gains from Business/Profession','Capital Gains','Income from Other Sources',
      'Clubbing, Set-off & Carry Forward','Deductions (Chapter VI-A)'
    ]},
    {title:'Advanced',items:[
      'Assessment Procedures','Appeals & Revision','Penalties & Prosecution','TDS / TCS',
      'International Taxation & Transfer Pricing','Equalisation Levy & Black Money Act'
    ]}
  ]},
  {id:'idt',name:'Indirect Tax Laws',code:'Paper 5',group:2,color:'idt',sections:[
    {title:'GST Law',items:[
      'GST Basics & Concepts','Supply under GST','Charge of GST','Place of Supply','Exemptions from GST',
      'Time of Supply','Value of Supply','Input Tax Credit','Registration','Tax Invoice & Credit Notes',
      'Returns & Payment','Assessment & Audit','Demand & Recovery','Refunds','Offences & Penalties'
    ]},
    {title:'Customs Law',items:[
      'Customs Law Basics','Levy & Exemption','Valuation','Import & Export Procedures','Duty Drawback','Baggage Rules'
    ]}
  ]},
  {id:'ibs',name:'Integrated Business Solutions',code:'Paper 6 — Case Study',group:2,color:'ibs',sections:[
    {title:'Case Study Practice',items:[
      'Case Study — FR + Audit Integration','Case Study — AFM + DT Integration','Case Study — IDT + Strategic Decisions',
      'Case Study — Multi-subject Integration','Case Study — Full Mock Case 1','Case Study — Full Mock Case 2'
    ]}
  ]}
];

// Flat list property for easier counting
SUBS.forEach(s => {
  s.ch = [];
  s.sections.forEach(sec => sec.items.forEach(it => s.ch.push(it)));
});
