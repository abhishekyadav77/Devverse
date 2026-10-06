import { escapeHtml } from '../utils/escape.js';

export const DEMO_PASSWORD = 'DemoPass123'; // clearly fake. The seed refuses to run in production.
export const DEMO_EMAIL_PATTERN = /@demo\.devverse\.test$/;

export const USERS = [
  { name: 'Demo Admin', username: 'demo_admin', role: 'admin', daysAgo: 40, bio: 'Demo administrator account for exploring the admin panel.' },
  { name: 'Aarav Mehta', username: 'aarav_dev', daysAgo: 36, bio: 'Full stack developer writing about the road from beginner to professional.', github: 'https://github.com/example' },
  { name: 'Sofia Alvarez', username: 'sofia_codes', daysAgo: 34, bio: 'Frontend engineer. React, accessibility and calm interfaces.', website: 'https://example.com' },
  { name: "Liam O'Connor", username: 'liam_builds', daysAgo: 31, bio: 'Backend developer who likes databases, terminals and fast queries.' },
  { name: 'Priya Nair', username: 'priya_ml', daysAgo: 28, bio: 'Machine learning engineer explaining hard ideas in plain language.' },
  { name: 'Noah Kim', username: 'noah_writes', daysAgo: 24, bio: 'Computer science student documenting what college actually teaches.' },
  { name: 'Maya Chen', username: 'maya_ships', daysAgo: 21, bio: 'Open source contributor and serial side-project finisher.', github: 'https://github.com/example' },
];

const h = (t) => `<h2>${escapeHtml(t)}</h2>`;
const p = (t) => `<p>${escapeHtml(t)}</p>`;
const ul = (items) => `<ul>${items.map((i) => `<li><p>${escapeHtml(i)}</p></li>`).join('')}</ul>`;
const quote = (t) => `<blockquote><p>${escapeHtml(t)}</p></blockquote>`;
const code = (lang, src) => `<pre><code class="language-${lang}">${escapeHtml(src)}</code></pre>`;
const table = (head, rows) =>
  `<table><tbody><tr>${head.map((c) => `<th>${escapeHtml(c)}</th>`).join('')}</tr>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;

export const POSTS = [
  {
    author: 'aarav_dev', category: 'Career', tags: ['Career', 'JavaScript', 'React'],
    title: 'My Journey From Beginner to Full Stack Developer',
    subtitle: 'Two years, three abandoned projects, and the habits that finally made things click.',
    content: [
      p('Two years ago I could not explain what a server did. Today I ship features across the database, the API and the interface. This is the honest version of how that happened, including the detours.'),
      h('Start with one project, not ten tutorials'),
      p('My first six months were tutorial hopping. I finished courses and could not build anything alone. Everything changed when I picked a single idea, a habit tracker, and refused to start another until it worked from the database to the screen.'),
      h('What actually moved me forward'),
      ul([
        'Building the same app twice, once messy and once clean, to see what refactoring really means',
        "Reading other people's pull requests before writing my own",
        'Writing down every error message and what finally fixed it',
        'Asking for code review early, while the code was still embarrassing',
      ]),
      quote('You do not learn to code by watching. You learn by getting stuck and getting unstuck, repeatedly.'),
      p('If you are at the start, pick something small, ship it, and let the next project be slightly harder. The roadmap matters far less than the repetition.'),
    ].join(''),
  },
  {
    author: 'aarav_dev', category: 'Projects', tags: ['MongoDB', 'React', 'Node.js'],
    title: 'Building My First MERN Application',
    subtitle: 'How I built a task tracker with MongoDB, Express, React and Node, and what I would change next time.',
    content: [
      p('A task tracker is the classic first MERN project, and for good reason. It touches every layer: a database model, a REST API, authentication and a reactive interface.'),
      h('The stack and why it works'),
      p('MongoDB stores tasks as flexible documents, Express exposes them over HTTP, React renders them, and Node runs the server. Using JavaScript everywhere means one language in your head instead of three.'),
      code('js', `app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: 'Title is required' });
  const task = await Task.create({ title: title.trim(), owner: req.user.id });
  res.status(201).json(task);
});`),
      h('Mistakes worth avoiding'),
      ul([
        'Trusting the browser: validate every request on the server, always',
        'Storing passwords as plain text instead of hashing them',
        'Putting secrets in the frontend code or in Git',
        'Fetching every record at once instead of paginating',
      ]),
      p('Build the boring version first. Authentication, validation and error messages are what separate a demo from an application.'),
    ].join(''),
  },
  {
    author: 'sofia_codes', category: 'Web Development', tags: ['React', 'JavaScript'],
    title: 'React State Management Without the Headache',
    subtitle: 'Most apps need less global state than you think. Here is how to decide where state should live.',
    content: [
      p('Every few months a new state library promises to fix state management. Most of the time the real problem is that too much state is global when it could be local.'),
      h('Keep state close to where it is used'),
      p('Start with useState in the component that needs the value. Lift it up only when two siblings need to share it. This single habit removes a surprising amount of complexity.'),
      h('When context is enough'),
      p('Context works well for values that rarely change and are needed everywhere, such as the current theme or the signed-in user.'),
      code('jsx', `const ThemeContext = createContext('light');

function App() {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={theme}>
      <Page onToggle={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />
    </ThemeContext.Provider>
  );
}`),
      p('Reach for a dedicated library only when you can name the exact problem it solves for you, not because a tutorial used it.'),
    ].join(''),
  },
  {
    author: 'liam_builds', category: 'Productivity', tags: ['Productivity', 'Tooling'],
    title: 'Why I Stopped Fearing the Command Line',
    subtitle: 'A handful of commands removed most of the friction from my daily work.',
    content: [
      p('For years I avoided the terminal and clicked through menus instead. The turning point was realising I only needed a dozen commands, not a manual.'),
      h('The small set that covers most days'),
      ul([
        'grep to find text across a whole project in a second',
        'git log with the oneline flag to see history at a glance',
        'curl to test an API without opening another tool',
        'Ctrl+R to search and reuse long commands from your history',
        'cd with a dash to jump back to the previous folder',
      ]),
      p('Once these became muscle memory, I started automating the repetitive parts with tiny shell scripts. Each script saved only a minute, but those minutes added up to hours.'),
      p('Learn one new command a week. In a year you will be faster than most people who never tried.'),
    ].join(''),
  },
  {
    author: 'liam_builds', category: 'Programming', tags: ['MongoDB', 'Performance'],
    title: 'A Practical Guide to MongoDB Indexes',
    subtitle: 'How to find slow queries, add the right index, and prove that it helped.',
    content: [
      p('A query that feels instant with 100 documents can crawl with 100,000. Indexes are the difference, and adding the right one is easier than it sounds.'),
      h('The index types you will use most'),
      table(['Index type', 'Best for', 'Example'], [
        ['Single field', 'Equality and sorting on one field', '{ slug: 1 }'],
        ['Compound', 'Filters and sorting together', '{ status: 1, publishedAt: -1 }'],
        ['Text', 'Keyword search', '{ title: "text" }'],
        ['TTL', 'Data that expires on its own', '{ createdAt: 1 }'],
      ]),
      h('Prove it with explain'),
      p('Never guess whether an index helped. Ask MongoDB to show its plan and look at how many documents it examined.'),
      code('js', `db.blogs
  .find({ status: 'published' })
  .sort({ publishedAt: -1 })
  .explain('executionStats')`),
      p('A COLLSCAN stage means MongoDB read every document. An IXSCAN stage means it used an index. Aim for the second one on every query your users hit often.'),
    ].join(''),
  },
  {
    author: 'priya_ml', category: 'AI & Machine Learning', tags: ['Machine Learning', 'Python'],
    title: 'How Machine Learning Models Actually Learn',
    subtitle: 'Loss, gradients and iteration, explained without the heavy maths.',
    content: [
      p('Under the hood, training a model is a loop: make a guess, measure how wrong it was, and nudge the settings to be a little less wrong next time.'),
      h('A model with one dial'),
      p('Imagine a model that multiplies its input by a single number called a weight. We want it to turn 3 into 12, so the ideal weight is 4. Training finds that number by itself.'),
      code('python', `weight = 0.0
learning_rate = 0.1

for step in range(50):
    prediction = weight * 3
    error = prediction - 12
    weight -= learning_rate * 2 * error * 3

print(round(weight, 2))  # 4.0`),
      h('What the loop is doing'),
      ul([
        'The error measures how far the guess is from the target',
        'The gradient says which direction reduces the error',
        'The learning rate controls how big each nudge is',
      ]),
      p('Real models repeat this with millions of weights, but the idea is identical. Too large a learning rate overshoots, too small is painfully slow.'),
    ].join(''),
  },
  {
    author: 'priya_ml', category: 'Programming', tags: ['Python', 'Clean Code'],
    title: 'Python Habits That Make Code Easier to Read',
    subtitle: 'Small choices in naming, structure and comments that your future self will thank you for.',
    content: [
      p('Code is read far more often than it is written. A few small habits make the difference between a script you dread opening and one you can change confidently.'),
      h('Name things for what they mean'),
      code('python', `# Harder to read
def f(d):
    return [x for x in d if x[1] > 18]

# Easier to read
def adults(people):
    return [person for person in people if person.age > 18]`),
      h('Habits worth keeping'),
      ul([
        'Keep functions short enough to describe in one sentence',
        'Return early instead of nesting conditions five levels deep',
        'Write comments that explain why, not what',
        'Format automatically so style is never a debate',
      ]),
      p('None of this is clever, and that is the point. Readable code is boring in the best possible way.'),
    ].join(''),
  },
  {
    author: 'noah_writes', category: 'College Life', tags: ['College', 'Career'],
    title: 'Surviving Your First Year of Computer Science',
    subtitle: 'What I wish someone had told me before the first midterm.',
    content: [
      p('My first semester felt like drinking from a fire hose. Everyone seemed to already know what a pointer was. Here is what I learned by the end of the year.'),
      h('You are not behind'),
      p('Many classmates had coded before, but most had gaps they were hiding. Asking a basic question in office hours is far cheaper than failing an exam to avoid looking unsure.'),
      h('Habits that paid off'),
      ul([
        'Starting assignments the day they are released, even for ten minutes',
        'Explaining each concept out loud to a friend or a rubber duck',
        'Building one small personal project alongside coursework',
        'Sleeping properly before exams instead of cramming all night',
      ]),
      p('Grades matter, but curiosity compounds. The students who kept building things outside class were the ones who found internships first.'),
    ].join(''),
  },
  {
    author: 'maya_ships', category: 'Open Source', tags: ['Open Source', 'Git'],
    title: 'Contributing to Open Source for the First Time',
    subtitle: 'A calm, step-by-step path to your first merged pull request.',
    content: [
      p('Open source looks intimidating from the outside. Your first contribution does not need to be a feature. A typo fix in the documentation counts and teaches you the whole workflow.'),
      h('The workflow in four commands'),
      code('bash', `git clone https://github.com/your-name/project.git
git checkout -b fix-typo-in-readme
git commit -am "Fix typo in README"
git push origin fix-typo-in-readme`),
      p('After pushing, open a pull request on the original repository and explain what you changed and why in a sentence or two.'),
      h('Finding something to work on'),
      ul([
        'Look for issues labelled good first issue',
        'Read the contributing guide before writing any code',
        'Comment on an issue to claim it so nobody duplicates your work',
      ]),
      p('Be patient with reviews. Maintainers are usually volunteers, and a polite follow-up after a week is perfectly fine.'),
    ].join(''),
  },
  {
    author: 'maya_ships', category: 'Projects', tags: ['Side Projects', 'Productivity'],
    title: 'Shipping a Side Project in Four Weekends',
    subtitle: 'A simple plan that finally got my ideas out of the notes app and onto the internet.',
    content: [
      p('I used to start side projects and abandon them by week three. The fix was not more motivation. It was a smaller scope and a fixed schedule.'),
      h('The four weekends'),
      ul([
        'Weekend one: decide the single problem the project solves and build the ugliest working version',
        'Weekend two: add the one feature that makes it genuinely useful',
        'Weekend three: fix rough edges, write the README and add basic tests',
        'Weekend four: deploy it, tell five people, and stop adding features',
      ]),
      p('The rule that matters most is the last one. A shipped project teaches you far more than a perfect one that never leaves your laptop.'),
      quote('Done and public beats perfect and private.'),
    ].join(''),
  },
  {
    author: 'sofia_codes', category: 'Web Development', tags: ['Node.js', 'JavaScript'],
    title: 'Node.js Error Handling That Scales',
    subtitle: 'One central place for errors keeps your API consistent and your controllers short.',
    content: [
      p('In a small Express app, every route has its own try and catch. In a large one that becomes hundreds of slightly different error responses. A central handler fixes that.'),
      h('Throw errors, handle them once'),
      p('Controllers should throw a meaningful error and move on. A single middleware at the end of the chain turns every error into the same JSON shape.'),
      code('js', `export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Something went wrong' : err.message,
  });
};`),
      h('Two details that matter'),
      ul([
        'Never send stack traces or internal messages to clients in production',
        'Wrap async handlers so rejected promises reach the error middleware',
      ]),
      p('Consistent errors make the frontend simpler too, because every failure looks the same.'),
    ].join(''),
  },
  {
    author: 'noah_writes', category: 'Career', tags: ['Writing', 'Career'],
    title: 'Notes on Writing Better Technical Blog Posts',
    subtitle: 'Writing about what you learn is the cheapest way to deepen it and the best portfolio you can build.',
    content: [
      p('Teaching forces clarity. Every time I write up something I just learned, I discover the parts I only thought I understood.'),
      h('A structure that works'),
      ul([
        'Open with the problem you had, not the solution',
        'Show the smallest example that demonstrates the idea',
        'Explain the mistakes you made along the way',
        'End with what you would do differently',
      ]),
      p('Write for the person you were a month ago. They are your reader, and they are far more common than experts.'),
      p('Publish before it feels ready. A clear post with one rough edge helps more people than a perfect post that stays in drafts.'),
    ].join(''),
  },
];

export const TOP_COMMENTS = [
  'This was exactly what I needed today. Thanks for writing it up.',
  'Great explanation. The example made it click for me.',
  'I tried this on my own project and it worked on the first run.',
  'Bookmarked. I will come back to this when I build mine.',
  'Would love a follow-up that goes deeper on the edge cases.',
  'Clear and practical, no fluff. More like this please.',
];

export const REPLIES = [
  'Glad it helped! Let me know how it goes.',
  'Thanks for reading. A follow-up is on my list.',
  'Appreciate it. Good luck with the build.',
];