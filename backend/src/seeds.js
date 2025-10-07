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
        name: 'Alice Jobseeker',
        email: 'alice@example.com',
        password: 'password123',
        role: 'jobseeker',
        profile: {
          bio: 'Full-stack developer',
          skills: ['JavaScript', 'React', 'Node.js'],
          experience: '3 years in web development',
          location: 'Bangalore, India',
          resume: 'https://example.com/resume-alice.pdf',
        },
      },
      {
        name: 'Bob Jobseeker',
        email: 'bob@example.com',
        password: 'password123',
        role: 'jobseeker',
        profile: {
          bio: 'Backend specialist',
          skills: ['Node.js', 'Express', 'MongoDB'],
          experience: '5 years building APIs',
          location: 'Pune, India',
          resume: 'https://example.com/resume-bob.pdf',
        },
      },
    ]);

    const employers = await User.create([
      {
        name: 'TechNova Solutions',
        email: 'hr@technova.com',
        password: 'password123',
        role: 'employer',
        company: {
          name: 'TechNova Solutions Pvt. Ltd.',
          description: 'Innovative software solutions provider.',
          website: 'https://technova.com',
          location: 'Bangalore, India',
          logo: 'https://res.cloudinary.com/demo/image/upload/v1690000000/sample.jpg',
        },
      },
      {
        name: 'DigitalWave Studios',
        email: 'careers@digitalwave.com',
        password: 'password123',
        role: 'employer',
        company: {
          name: 'DigitalWave Studios',
          description: 'Creative digital agency focused on immersive experiences.',
          website: 'https://digitalwave.com',
          location: 'Mumbai, India',
          logo: 'https://res.cloudinary.com/demo/image/upload/v1690000000/sample.jpg',
        },
      },
    ]);

    const [technova, digitalwave] = employers;

    const jobs = await Job.insertMany([
      {
        title: 'Senior Software Engineer',
        company: technova.company.name,
        location: 'Bangalore, India',
        type: 'full-time',
        status: 'active',
        description: 'Lead development of enterprise-grade web applications.',
        requirements: '- 5+ years experience\n- Proficiency in React and Node.js',
        salary: { min: 1200000, max: 2000000 },
        postedBy: technova._id,
        applicants: [],
      },
      {
        title: 'UI/UX Designer',
        company: digitalwave.company.name,
        location: 'Remote',
        type: 'contract',
        status: 'active',
        description: 'Design engaging user experiences for clients across industries.',
        requirements: '- 3+ years experience\n- Strong portfolio of shipped products',
        salary: { min: 800000, max: 1200000 },
        postedBy: digitalwave._id,
        applicants: [],
      },
    ]);

    const [job1, job2] = jobs;

    const application1 = await Application.create({
      job: job1._id,
      applicant: jobseekers[0]._id,
      coverLetter: 'I would love to join TechNova and contribute to your enterprise projects.',
      resume: jobseekers[0].profile.resume,
      status: 'pending',
    });

    await Job.findByIdAndUpdate(job1._id, { $push: { applicants: application1._id } });

    const application2 = await Application.create({
      job: job2._id,
      applicant: jobseekers[1]._id,
      coverLetter: 'My experience crafting intuitive UI makes me a great fit.',
      resume: jobseekers[1].profile.resume,
      status: 'reviewed',
      reviewedAt: new Date(),
      notes: 'Strong portfolio, schedule interview.',
    });

    await Job.findByIdAndUpdate(job2._id, { $push: { applicants: application2._id } });

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database', error);
    process.exit(1);
  }
};

seed();
