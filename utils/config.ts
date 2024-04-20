export const hashRoutes = [
  ["Home", "/#intro"],
  ["About", "/#about"],
  ["Experience", "/#experience"],
  ["Projects", "/#projects"],
  ["Contact", "/#contact"],
  ["Resume", "/resume.pdf"]
];

export const sections = hashRoutes.map(route => route[0].toLowerCase());

export const introAnimatedText = [
  "Developer",
  "Programmer",
  "Tech Enthusiast",
  "Gamer"
];
export const myName = "Aman Arya";
export const shortDescription = "JUNIOR SOFTWARE ENGINEER";

export const longDescription = "Junior Engineer at Goldman Sachs with a passion for technology. Experienced in Java, Game Development, and now focused on Web Development with Next.js, TypeScript, and Framer Motion. Enthusiastic about learning and exploring new technologies. Check out my portfolio for more!";

export const socialMediaDetails = [
  {
    name: 'GitHub',
    url: 'https://github.com/Am4nn',
  },
  {
    name: 'Linkedin',
    url: 'https://www.linkedin.com/in/aman-arya-79a52121b',
  },
  // {
  //   name: 'Instagram',
  //   url: 'https://www.instagram.com/am4n_arya',
  // },
  {
    name: 'Email',
    url: 'mailto:125aryaaman@gmail.com',
  }
];

export const skills = [
  "C", "C++", "Java", "Python", "HTML/CSS", "Javascript", "Typescript", "MySQL",
  "MongoDB", "Redis", "Tailwind", "React", "NextJs", "Node", "Redux", "Boot", "RestAPI",
  "ExpressJs", "SocketIO", "MUI", "Git", "Github", "VSCode", "IntellijIdea", "Docker",
  "Postman", "OpenGL", "Framer", "Tableau", "Playwright", "Cucumber", "Legend", "Vercel"
];

export const experiences = [
  {
    title: "Summer Analyst",
    company_name: "Goldman Sachs Pvt Ltd",
    bottomColor: "#6d92bf",
    icon: "/company/Goldman_Sachs.png",
    date: "May 2023 - July 2023",
    points: [
      "Engaged in the Goldman Sachs team maintaining client fee calculation applications, implementing 10+ efficiency-focused enhancements",
      "Implemented a feature enabling users to charge fees as last year to bulk accounts in one click, reducing process time by 85% while ensuring reliability with 20+ JUnit test cases",
      "Optimized user experience by decreasing UI loading time by 76% through enhanced MongoDB queries",
      "Rectified over 15 bugs within the internal fee calculation application"
    ],
  },
  {
    title: "Exam Module 2",
    company_name: "SGSITS Indore",
    bottomColor: "#f1df87",
    icon: "/company/SGSITS_Logo.png",
    date: "Feb 2023 - Apr 2023",
    points: [
      "Developed a robust web-based system to automate the examiner allocation process for multiple departments within the college",
      "Implemented various functionalities to simplify the examiner allocation workflow",
      "Built a user-friendly interface with React. Leveraged SQL for efficient database management and Nodejs for integration"
    ],
  },
  {
    title: "Senior Coordinator",
    company_name: "#include Club SGSITS",
    bottomColor: "#bc1010",
    icon: "/company/Hash_Include.png",
    date: "Oct 2021 - present",
    points: [
      "Developing and maintaining web applications for hackindore using Nextjs and other related technologies",
      "With the assistance of other coordinators, successfully organized events and guided sessions for students",
      'Speaker at "Tech-tonic" a programming road-map for freshers',
    ],
  }
];

export const projectsData = [
  {
    title: 'Online-Judge',
    desciption: 'Build a platform that remotely runs and compiles user submitted code for a programming problem securely and judges if the code is correct/wrong',
    tech: ['Nodejs', 'React', 'Docker', 'Redis', 'MongoDB', 'Expressjs', 'JWT'],
    github: 'https://github.com/Am4nn/Online-Judge-Project',
    external: 'https://oj.amanarya.com',
    image: '/projects/oj-front.png'
  },
  {
    title: 'Portfolio',
    desciption: 'Crafted an engaging portfolio site with ReactJS and Three.js, enhancing user interaction through a serverless feedback system powered by a custom API',
    tech: ['Nodejs', 'React', 'Threejs', 'Nodemailer', 'MUI', 'Bootstrap', 'drei'],
    github: 'https://github.com/Am4nn/Portfolio-Website',
    external: 'https://www.amanarya.com',
    image: '/projects/portfolio-front.png'
  },
  {
    title: 'Draw-Graphs',
    desciption: 'Designed a Java Swing app for user-friendly equation input and dynamic graph visualization, showcasing strong Java and GUI development skills',
    tech: ['Java', 'Java-Swing', 'Java-Collections'],
    github: 'https://github.com/Am4nn/Draw-Graphs',
    image: '/projects/draw-graph-front.png'
  },
  {
    title: 'Super-Mario',
    desciption: "Designed and developed 'Super Mario', a captivating 2D game using C++ and the SFML, showcasing shader programming skills for visually stunning effects in the user interface",
    tech: ['Cpp', 'SFML', 'Shader', 'Vector', 'CMake'],
    github: 'https://github.com/Am4nn/Super-Mario-SFML',
    image: '/projects/super-mario-front.png'
  }
];

export const contactData = {
  imagesrc: '/stars/StarBackground.png',
  imagealt: 'Star Background Image',
};
