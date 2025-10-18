'use client';

export default function HelpTab() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h2>What is Pairwise Testing?</h2>
      <p>
        Pairwise testing (also known as all-pairs testing) is a combinatorial testing method
        that drastically reduces the number of test cases needed while maintaining high
        coverage of potential interactions.
      </p>

      <h3>How It Works</h3>
      <p>
        Instead of testing all possible combinations of parameters (which grows exponentially),
        pairwise testing ensures that every possible pair of values across any two parameters
        is covered at least once.
      </p>

      <h3>Benefits</h3>
      <ul>
        <li>
          <strong>Reduced Test Cases:</strong> Dramatically fewer tests compared to exhaustive
          testing
        </li>
        <li>
          <strong>High Coverage:</strong> Studies show that pairwise testing finds 50-90% of
          bugs
        </li>
        <li>
          <strong>Time Efficient:</strong> Faster test execution while maintaining quality
        </li>
        <li>
          <strong>Cost Effective:</strong> Reduced resources needed for testing
        </li>
      </ul>

      <h3>Example</h3>
      <p>
        Consider testing with 3 browsers, 3 operating systems, and 3 versions:
      </p>
      <ul>
        <li>
          <strong>Exhaustive:</strong> 3 × 3 × 3 = 27 test cases
        </li>
        <li>
          <strong>Pairwise:</strong> Typically 9-12 test cases for 100% pair coverage
        </li>
      </ul>

      <h3>Input Format</h3>
      <p>Provide your test parameters in this format:</p>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">
        {`{
  "labels": ["Browser", "OS", "Version"],
  "parameters": [
    ["Chrome", "Firefox", "Safari"],
    ["Windows", "macOS", "Linux"],
    ["Latest", "Previous"]
  ]
}`}
      </pre>

      <h3>Limitations</h3>
      <ul>
        <li>Does not test all 3-way or higher-order interactions</li>
        <li>May not catch bugs that only appear with specific 3+ parameter combinations</li>
        <li>Not suitable for safety-critical systems requiring exhaustive testing</li>
      </ul>

      <h3>Resources</h3>
      <ul>
        <li>
          <a
            href="https://www.pairwise.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Pairwise.org - Comprehensive Guide
          </a>
        </li>
        <li>
          <a
            href="https://github.com/stevenayal/allpairs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            AllPairs CLI - Python Command-Line Tool
          </a>
        </li>
        <li>
          <a
            href="/docs/tools/allpairs"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            AIQUAA AllPairs Documentation
          </a>
        </li>
      </ul>

      <h3>Tips</h3>
      <ul>
        <li>Start with the most important parameters</li>
        <li>Keep parameter names clear and descriptive</li>
        <li>Use the JSON/YAML tab for bulk editing</li>
        <li>Export results as CSV for use in test frameworks</li>
        <li>Review generated combinations to ensure they make sense</li>
      </ul>
    </div>
  );
}
