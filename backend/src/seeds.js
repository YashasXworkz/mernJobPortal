const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');

    // clear collections
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@jobportal.com',
      password: 'admin123456',
      role: 'admin',
    });
    
    console.log('Admin created: admin@jobportal.com');

    const jobseekers = await User.create([
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        password: 'password123',
        role: 'jobseeker',
        phone: '+91 9876543210',
        profile: {
          bio: 'Passionate Full-Stack Developer with expertise in MERN stack. Built 15+ production applications.',
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
          experience: '3.5 years in web development at top tech companies',
          location: 'Bangalore, Karnataka',
        },
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@example.com',
        password: 'password123',
        role: 'jobseeker',
        phone: '+91 9988776655',
        profile: {
          bio: 'Senior Backend Engineer specializing in scalable microservices architecture',
          skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker', 'Kubernetes'],
          experience: '5 years building high-performance APIs and distributed systems',
          location: 'Pune, Maharashtra',
        },
      },
      {
        name: 'Sneha Patel',
        email: 'sneha.patel@example.com',
        password: 'password123',
        role: 'jobseeker',
        phone: '+91 8877665544',
        profile: {
          bio: 'UI/UX Designer with a passion for creating intuitive user experiences',
          skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Design Systems'],
          experience: '4 years designing for web and mobile applications',
          location: 'Mumbai, Maharashtra',
        },
      },
      {
        name: 'Arjun Reddy',
        email: 'arjun.reddy@example.com',
        password: 'password123',
        role: 'jobseeker',
        phone: '+91 7766554433',
        profile: {
          bio: 'Data Scientist with expertise in ML/AI and predictive analytics',
          skills: ['Python', 'TensorFlow', 'PyTorch', 'Pandas', 'SQL', 'Machine Learning'],
          experience: '2.5 years in data science and analytics',
          location: 'Hyderabad, Telangana',
        },
      },
      {
        name: 'Kavya Nair',
        email: 'kavya.nair@example.com',
        password: 'password123',
        role: 'jobseeker',
        phone: '+91 6655443322',
        profile: {
          bio: 'Frontend Developer specializing in React and modern web technologies',
          skills: ['React', 'Next.js', 'Tailwind CSS', 'JavaScript', 'HTML5', 'CSS3'],
          experience: '2 years building responsive web applications',
          location: 'Chennai, Tamil Nadu',
        },
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        password: 'password123',
        role: 'jobseeker',
        phone: '+91 5544332211',
        profile: {
          bio: 'DevOps Engineer with strong background in cloud infrastructure and CI/CD',
          skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
          experience: '4.5 years in DevOps and cloud engineering',
          location: 'Gurgaon, Haryana',
        },
      },
    ]);

    const employers = await User.create([
      {
        name: 'TechVista Solutions',
        email: 'hr@techvista.in',
        password: 'password123',
        role: 'employer',
        company: {
          name: 'TechVista Solutions Pvt. Ltd.',
          description: 'Leading software development company specializing in enterprise solutions, cloud services, and AI-powered applications. Serving 200+ clients globally.',
          website: 'https://techvista.in',
          location: 'Bangalore, Karnataka',
          logo: 'https://ui-avatars.com/api/?name=TechVista&background=6366f1&color=fff&size=200',
        },
      },
      {
        name: 'InnovateLabs India',
        email: 'careers@innovatelabs.co.in',
        password: 'password123',
        role: 'employer',
        company: {
          name: 'InnovateLabs India',
          description: 'Product-based startup building innovative SaaS solutions for businesses. Winner of TechCrunch Disrupt India 2024.',
          website: 'https://innovatelabs.co.in',
          location: 'Pune, Maharashtra',
          logo: 'https://ui-avatars.com/api/?name=InnovateLabs&background=8b5cf6&color=fff&size=200',
        },
      },
      {
        name: 'DigitalCraft Studios',
        email: 'jobs@digitalcraft.in',
        password: 'password123',
        role: 'employer',
        company: {
          name: 'DigitalCraft Studios',
          description: 'Award-winning creative digital agency focused on brand experiences, UI/UX design, and mobile app development.',
          website: 'https://digitalcraft.in',
          location: 'Mumbai, Maharashtra',
          logo: 'https://ui-avatars.com/api/?name=DigitalCraft&background=ec4899&color=fff&size=200',
        },
      },
      {
        name: 'CloudScale Technologies',
        email: 'hr@cloudscale.tech',
        password: 'password123',
        role: 'employer',
        company: {
          name: 'CloudScale Technologies',
          description: 'Cloud infrastructure and DevOps consulting firm helping enterprises migrate to cloud and build scalable systems.',
          website: 'https://cloudscale.tech',
          location: 'Gurgaon, Haryana',
          logo: 'https://ui-avatars.com/api/?name=CloudScale&background=10b981&color=fff&size=200',
        },
      },
      {
        name: 'DataMinds Analytics',
        email: 'careers@dataminds.ai',
        password: 'password123',
        role: 'employer',
        company: {
          name: 'DataMinds Analytics',
          description: 'AI/ML solutions provider specializing in predictive analytics, natural language processing, and computer vision.',
          website: 'https://dataminds.ai',
          location: 'Hyderabad, Telangana',
          logo: 'https://ui-avatars.com/api/?name=DataMinds&background=f59e0b&color=fff&size=200',
        },
      },
    ]);

    const [techvista, innovatelabs, digitalcraft, cloudscale, dataminds] = employers;

    const jobs = await Job.insertMany([
      {
        title: 'Senior Full Stack Developer (MERN)',
        company: techvista.company.name,
        location: 'Bangalore, Karnataka',
        type: 'full-time',
        status: 'active',
        description: 'Lead the development of enterprise-grade web applications using MERN stack. Work on cutting-edge cloud-native solutions and mentor junior developers.',
        requirements: '- 5+ years of professional experience in web development\n- Expert-level proficiency in React, Node.js, Express, and MongoDB\n- Strong understanding of RESTful APIs and microservices architecture\n- Experience with cloud platforms (AWS/Azure/GCP)\n- Excellent problem-solving and communication skills',
        salary: { min: 1500000, max: 2500000 },
        skills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript', 'AWS'],
        experience: 'senior',
        benefits: ['Health insurance', 'Flexible work hours', 'Performance bonuses', 'Learning budget'],
        postedBy: techvista._id,
        applicants: [],
      },
      {
        title: 'Backend Developer (Node.js)',
        company: innovatelabs.company.name,
        location: 'Pune, Maharashtra',
        type: 'full-time',
        status: 'active',
        description: 'Build scalable backend services for our SaaS platform serving millions of users. Work with latest technologies and agile methodologies.',
        requirements: '- 3+ years experience in backend development\n- Strong expertise in Node.js and Express.js\n- Experience with MongoDB, Redis, and PostgreSQL\n- Knowledge of microservices and message queues\n- Understanding of security best practices',
        salary: { min: 1000000, max: 1800000 },
        skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'PostgreSQL', 'Microservices'],
        experience: 'mid',
        benefits: ['Stock options', 'Remote work', 'Health insurance', 'Team outings'],
        postedBy: innovatelabs._id,
        applicants: [],
      },
      {
        title: 'UI/UX Designer',
        company: digitalcraft.company.name,
        location: 'Mumbai, Maharashtra',
        type: 'full-time',
        status: 'active',
        description: 'Create stunning user experiences for web and mobile applications. Work with top brands and lead design projects from concept to delivery.',
        requirements: '- 4+ years of UI/UX design experience\n- Proficiency in Figma, Adobe XD, and Sketch\n- Strong portfolio showcasing design projects\n- Experience with user research and usability testing\n- Understanding of design systems and accessibility',
        salary: { min: 900000, max: 1500000 },
        skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping', 'Design Systems'],
        experience: 'senior',
        benefits: ['Creative workspace', 'Flexible hours', 'Health insurance', 'Mac/iPad provided'],
        postedBy: digitalcraft._id,
        applicants: [],
      },
      {
        title: 'DevOps Engineer',
        company: cloudscale.company.name,
        location: 'Gurgaon, Haryana',
        type: 'full-time',
        status: 'active',
        description: 'Manage cloud infrastructure and implement CI/CD pipelines for enterprise clients. Build automation tools and ensure system reliability.',
        requirements: '- 4+ years of DevOps experience\n- Expertise in AWS, Azure, or GCP\n- Strong knowledge of Docker and Kubernetes\n- Experience with Terraform and Ansible\n- Proficiency in scripting (Bash, Python)',
        salary: { min: 1300000, max: 2200000 },
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Python'],
        experience: 'senior',
        benefits: ['Remote work', 'Certifications budget', 'Health insurance', 'Performance bonuses'],
        postedBy: cloudscale._id,
        applicants: [],
      },
      {
        title: 'Data Scientist',
        company: dataminds.company.name,
        location: 'Hyderabad, Telangana',
        type: 'full-time',
        status: 'active',
        description: 'Build ML models and analytics solutions for clients across various industries. Work on cutting-edge AI/ML projects.',
        requirements: '- 3+ years in data science or ML engineering\n- Strong proficiency in Python and ML libraries\n- Experience with TensorFlow, PyTorch, or scikit-learn\n- Knowledge of statistics and probability\n- Experience with data visualization tools',
        salary: { min: 1200000, max: 2000000 },
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'SQL', 'Data Analysis'],
        experience: 'mid',
        benefits: ['Research time', 'Conference attendance', 'Health insurance', 'Relocation support'],
        postedBy: dataminds._id,
        applicants: [],
      },
      {
        title: 'Frontend Developer (React)',
        company: innovatelabs.company.name,
        location: 'Remote',
        type: 'full-time',
        status: 'active',
        description: 'Develop modern, responsive web applications using React and Next.js. Collaborate with designers to create pixel-perfect UIs.',
        requirements: '- 2+ years experience with React\n- Proficiency in JavaScript/TypeScript\n- Experience with Next.js and modern build tools\n- Understanding of responsive design and CSS frameworks\n- Knowledge of state management (Redux/Context API)',
        salary: { min: 700000, max: 1200000 },
        skills: ['React', 'Next.js', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redux'],
        experience: 'mid',
        benefits: ['Work from anywhere', 'Flexible hours', 'Learning budget', 'Health insurance'],
        postedBy: innovatelabs._id,
        applicants: [],
      },
      {
        title: 'Mobile App Developer (React Native)',
        company: digitalcraft.company.name,
        location: 'Mumbai, Maharashtra',
        type: 'full-time',
        status: 'active',
        description: 'Build cross-platform mobile applications for iOS and Android. Work on high-traffic consumer apps.',
        requirements: '- 3+ years mobile development experience\n- Expert in React Native\n- Experience with native modules and platform APIs\n- Published apps on App Store and Play Store\n- Understanding of mobile UI/UX patterns',
        salary: { min: 1000000, max: 1600000 },
        skills: ['React Native', 'JavaScript', 'iOS', 'Android', 'Redux', 'Mobile UI'],
        experience: 'mid',
        benefits: ['Latest devices provided', 'Health insurance', 'Team events', 'Remote flexibility'],
        postedBy: digitalcraft._id,
        applicants: [],
      },
      {
        title: 'Product Manager',
        company: techvista.company.name,
        location: 'Bangalore, Karnataka',
        type: 'full-time',
        status: 'active',
        description: 'Lead product strategy and roadmap for enterprise software solutions. Work closely with engineering, design, and business teams.',
        requirements: '- 5+ years in product management\n- Experience with B2B SaaS products\n- Strong analytical and strategic thinking skills\n- Excellent stakeholder management\n- Technical background preferred',
        salary: { min: 2000000, max: 3000000 },
        skills: ['Product Strategy', 'Roadmapping', 'Agile', 'Data Analysis', 'Stakeholder Management'],
        experience: 'lead',
        benefits: ['Stock options', 'Health insurance', 'Flexible work', 'Performance bonuses'],
        postedBy: techvista._id,
        applicants: [],
      },
      {
        title: 'QA Automation Engineer',
        company: cloudscale.company.name,
        location: 'Chennai, Tamil Nadu',
        type: 'full-time',
        status: 'active',
        description: 'Design and implement automated testing frameworks. Ensure quality of cloud-based applications and infrastructure.',
        requirements: '- 3+ years in QA automation\n- Experience with Selenium, Cypress, or Playwright\n- Knowledge of API testing tools (Postman, REST Assured)\n- Proficiency in JavaScript or Python\n- Understanding of CI/CD pipelines',
        salary: { min: 800000, max: 1400000 },
        skills: ['Selenium', 'Cypress', 'JavaScript', 'API Testing', 'CI/CD', 'Test Automation'],
        experience: 'mid',
        benefits: ['Remote work', 'Certifications', 'Health insurance', 'Learning resources'],
        postedBy: cloudscale._id,
        applicants: [],
      },
      {
        title: 'Business Analyst',
        company: techvista.company.name,
        location: 'Noida, Uttar Pradesh',
        type: 'full-time',
        status: 'active',
        description: 'Bridge the gap between business needs and technical solutions. Gather requirements and create detailed specifications.',
        requirements: '- 4+ years as Business Analyst\n- Strong requirement gathering skills\n- Experience with Agile methodologies\n- Proficiency in documentation tools\n- Excellent communication skills',
        salary: { min: 1000000, max: 1600000 },
        skills: ['Requirements Analysis', 'Agile', 'Documentation', 'Stakeholder Management', 'SQL'],
        experience: 'senior',
        benefits: ['Health insurance', 'Work from home options', 'Training programs'],
        postedBy: techvista._id,
        applicants: [],
      },
      {
        title: 'Junior Frontend Developer',
        company: innovatelabs.company.name,
        location: 'Pune, Maharashtra',
        type: 'full-time',
        status: 'active',
        description: 'Join our frontend team to build modern web applications. Perfect opportunity for developers looking to grow their career.',
        requirements: '- 1-2 years experience with React\n- Good understanding of HTML, CSS, JavaScript\n- Familiarity with Git and version control\n- Eagerness to learn new technologies\n- Good problem-solving skills',
        salary: { min: 500000, max: 800000 },
        skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
        experience: 'entry',
        benefits: ['Mentorship program', 'Health insurance', 'Learning budget', 'Team events'],
        postedBy: innovatelabs._id,
        applicants: [],
      },
      {
        title: 'Graphic Designer',
        company: digitalcraft.company.name,
        location: 'Remote',
        type: 'part-time',
        status: 'active',
        description: 'Create visual content for digital campaigns, social media, and brand materials. Work on diverse creative projects.',
        requirements: '- 2+ years in graphic design\n- Proficiency in Adobe Creative Suite\n- Strong portfolio of design work\n- Understanding of brand guidelines\n- Ability to work independently',
        salary: { min: 400000, max: 700000 },
        skills: ['Adobe Photoshop', 'Illustrator', 'InDesign', 'Brand Design', 'Social Media Graphics'],
        experience: 'mid',
        benefits: ['Flexible hours', 'Remote work', 'Creative freedom', 'Health insurance'],
        postedBy: digitalcraft._id,
        applicants: [],
      },
    ]);

    const [job1, job2, job3, job4, job5, job6, job7, job8, job9, job10, job11, job12] = jobs;

    // Create sample applications
    const application1 = await Application.create({
      job: job1._id,
      applicant: jobseekers[0]._id,
      coverLetter: 'I am excited to apply for the Senior Full Stack Developer position at TechVista Solutions. With 3.5 years of hands-on experience in MERN stack development, I have successfully delivered 15+ production applications. My expertise in React, Node.js, and cloud technologies aligns perfectly with your requirements. I am passionate about building scalable solutions and would love to contribute to your enterprise projects.',
      status: 'pending',
    });

    const application2 = await Application.create({
      job: job2._id,
      applicant: jobseekers[1]._id,
      coverLetter: 'I am writing to express my strong interest in the Backend Developer position at InnovateLabs India. My 5 years of experience building high-performance APIs and distributed systems makes me an ideal candidate. I have worked extensively with Node.js, MongoDB, Redis, and microservices architecture. I am excited about the opportunity to build scalable backend services for your SaaS platform.',
      status: 'reviewed',
      reviewedAt: new Date(),
      notes: 'Excellent experience with microservices. Strong candidate. Schedule technical interview.',
    });

    const application3 = await Application.create({
      job: job3._id,
      applicant: jobseekers[2]._id,
      coverLetter: 'As an experienced UI/UX Designer with 4 years in the industry, I am thrilled about the opportunity to join DigitalCraft Studios. My portfolio showcases diverse projects where I have created intuitive user experiences for both web and mobile applications. I am proficient in Figma, Adobe XD, and have a strong understanding of design systems and accessibility standards.',
      status: 'shortlisted',
      reviewedAt: new Date(),
      notes: 'Impressive portfolio. Great fit for our design team.',
      interviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      interviewNotes: 'First round: Portfolio review and culture fit discussion',
    });

    const application4 = await Application.create({
      job: job5._id,
      applicant: jobseekers[3]._id,
      coverLetter: 'I am eager to apply for the Data Scientist position at DataMinds Analytics. With 2.5 years of experience in ML/AI and predictive analytics, I have worked on various projects involving TensorFlow, PyTorch, and data visualization. I am passionate about solving complex problems using data-driven approaches and would be thrilled to work on cutting-edge AI/ML projects at your organization.',
      status: 'pending',
    });

    const application5 = await Application.create({
      job: job6._id,
      applicant: jobseekers[4]._id,
      coverLetter: 'I am excited about the Frontend Developer position at InnovateLabs India. My 2 years of experience with React and modern web technologies has equipped me with skills in Next.js, Tailwind CSS, and state management. I am passionate about creating responsive, user-friendly web applications and would love the opportunity to work remotely while contributing to your innovative SaaS solutions.',
      status: 'pending',
    });

    const application6 = await Application.create({
      job: job4._id,
      applicant: jobseekers[5]._id,
      coverLetter: 'With 4.5 years of experience in DevOps and cloud engineering, I am well-prepared for the DevOps Engineer role at CloudScale Technologies. I have extensive expertise in AWS, Docker, Kubernetes, and Terraform. I have successfully implemented CI/CD pipelines and managed cloud infrastructure for multiple enterprise clients. I am excited about the opportunity to build automation tools and ensure system reliability for your clients.',
      status: 'accepted',
      reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      notes: 'Outstanding candidate. Offered position. Start date confirmed.',
    });

    // Update jobs with applicants
    await Job.findByIdAndUpdate(job1._id, { $push: { applicants: application1._id } });
    await Job.findByIdAndUpdate(job2._id, { $push: { applicants: application2._id } });
    await Job.findByIdAndUpdate(job3._id, { $push: { applicants: application3._id } });
    await Job.findByIdAndUpdate(job5._id, { $push: { applicants: application4._id } });
    await Job.findByIdAndUpdate(job6._id, { $push: { applicants: application5._id } });
    await Job.findByIdAndUpdate(job4._id, { $push: { applicants: application6._id } });

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📊 Seeded Data Summary:');
    console.log('━'.repeat(50));
    console.log(`👤 Admin: 1 user (admin@jobportal.com / admin123456)`);
    console.log(`👥 Job Seekers: ${jobseekers.length} users`);
    console.log(`🏢 Employers: ${employers.length} companies`);
    console.log(`💼 Jobs: ${jobs.length} job listings`);
    console.log(`📄 Applications: 6 sample applications`);
    console.log('━'.repeat(50));
    console.log('\n🔑 Test Accounts:');
    console.log('   Admin: admin@jobportal.com / admin123456');
    console.log('   Jobseeker: priya.sharma@example.com / password123');
    console.log('   Employer: hr@techvista.in / password123');
    console.log('\n🚀 Ready to use!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database', error);
    process.exit(1);
  }
};

seed();
