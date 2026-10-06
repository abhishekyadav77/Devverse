import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const About = () => {
  const location = useLocation();

  useEffect(() => {
    const scrollToSection = () => {
      if (location.hash) {
        const id = location.hash.substring(1);
        const element = document.getElementById(id);

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    };

    // Wait for the page to render before scrolling
    const timer = setTimeout(scrollToSection, 100);

    return () => clearTimeout(timer);
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <section
          id="devverse"
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-5">
            About DevVerse
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A developer-focused platform where developers can learn, write,
            explore, share experiences, and connect with the community.
          </p>
        </section>

        {/* About DevVerse */}
        <section className="mb-14">
          <h2 className="text-3xl font-bold mb-5">
            About DevVerse
          </h2>

          <p className="text-gray-700 dark:text-gray-300 leading-8 mb-4">
            DevVerse is a developer-focused blogging and community platform
            created to make it easier for developers to share knowledge,
            experiences, ideas, and lessons learned while building in tech.
          </p>

          <p className="text-gray-700 dark:text-gray-300 leading-8">
            Whether you're just starting your programming journey or already
            working on real-world projects, DevVerse is a place to learn,
            write, explore, and connect with other developers.
          </p>
        </section>

        {/* Developer */}
        <section
          id="developer"
          className="mb-14"
        >
          <h2 className="text-3xl font-bold mb-5">
            About the Developer
          </h2>

          <p className="text-gray-700 dark:text-gray-300 leading-8 mb-4">
            Hi, I'm <strong>Abhishek Kumar Yadav</strong>, a B.Tech Computer
            Science and Engineering student and a full-stack developer who
            enjoys turning ideas into working applications.
          </p>

          <p className="text-gray-700 dark:text-gray-300 leading-8 mb-4">
            My journey in development hasn't always been straightforward.
            There have been times when I struggled with consistency, felt
            confused about what to learn next, and compared my progress with
            others.
          </p>

          <p className="text-gray-700 dark:text-gray-300 leading-8">
            I enjoy working with technologies such as JavaScript, React,
            Node.js, Express.js, MongoDB, and modern web technologies.
            I particularly enjoy building full-stack applications where
            frontend, backend, databases, authentication, APIs, and deployment
            come together.
          </p>
        </section>

        {/* Why */}
        <section className="mb-14">
          <h2 className="text-3xl font-bold mb-5">
            Why I Built DevVerse
          </h2>

          <p className="text-gray-700 dark:text-gray-300 leading-8 mb-5">
            While learning development, I realized that some of the most
            useful lessons don't come from tutorials alone.
          </p>

          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li>• Fixing a bug after hours of debugging</li>
            <li>• Understanding a concept that initially seemed difficult</li>
            <li>• Building a project from scratch</li>
            <li>• Deploying something for the first time</li>
            <li>• Making mistakes and learning from them</li>
            <li>• Learning from another developer's experience</li>
          </ul>

          <p className="text-xl font-semibold mt-8">
            Learn. Build. Share. Connect.
          </p>
        </section>

        {/* Goals */}
        <section className="mb-14">
          <h2 className="text-3xl font-bold mb-5">
            What I'm Working Toward
          </h2>

          <p className="text-gray-700 dark:text-gray-300 leading-8">
            I'm continuously improving my skills in software development,
            problem solving, and system building. My goal isn't simply to
            learn more technologies. It's to become better at building useful
            software, solving real problems, and understanding how different
            parts of a system work together.
          </p>
        </section>

        {/* Footer Card */}
        <section className="text-center border rounded-2xl p-10 bg-white dark:bg-gray-900">
          <h2 className="text-2xl font-bold mb-3">
            Built & Maintained by
          </h2>

          <h3 className="text-xl font-semibold">
            Abhishek Kumar Yadav
          </h3>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            B.Tech CSE · Full-Stack Developer
          </p>

          <blockquote className="mt-6 italic text-gray-600 dark:text-gray-400">
            "You don't have to have everything figured out.
            You just have to keep building."
          </blockquote>

          <div className="flex justify-center gap-6 mt-8">
            <a
              href="https://github.com/abhishekyadav77"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/abhishek-yadav-mzp/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              LinkedIn
            </a>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;