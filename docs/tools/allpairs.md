# All Pairs Generator - Documentation

## Overview

The All Pairs Generator is a web-based tool for generating pairwise (2-way) combinatorial test cases. It helps reduce the number of test cases needed while maintaining high coverage of parameter interactions.

## What is Pairwise Testing?

Pairwise testing, also known as all-pairs testing or 2-way testing, is a combinatorial software testing method that tests all possible discrete combinations of parameters taken two at a time.

### Benefits

- **Dramatically reduced test cases**: Instead of testing all possible combinations (exhaustive testing), pairwise testing covers all possible pairs
- **High defect detection**: Research shows that pairwise testing can find 50-90% of defects
- **Time and cost efficient**: Fewer test cases mean faster execution and lower costs
- **Practical coverage**: Provides good coverage without the exponential growth of exhaustive testing

### Example

Consider testing a web application with:
- 3 browsers (Chrome, Firefox, Safari)
- 3 operating systems (Windows, macOS, Linux)
- 3 versions (Latest, Previous, Legacy)

**Exhaustive testing**: 3 × 3 × 3 = **27 test cases**

**Pairwise testing**: Typically **9-12 test cases** for 100% pair coverage

## Input Format

The All Pairs Generator accepts input in multiple formats:

### JSON Format (Direct)

```json
{
  "labels": ["Browser", "OS", "Version"],
  "parameters": [
    ["Chrome", "Firefox", "Safari"],
    ["Windows", "macOS", "Linux"],
    ["Latest", "Previous", "Legacy"]
  ]
}
```

### JSON Format (Object)

```json
{
  "Browser": ["Chrome", "Firefox", "Safari"],
  "OS": ["Windows", "macOS", "Linux"],
  "Version": ["Latest", "Previous", "Legacy"]
}
```

### YAML Format

```yaml
labels:
  - Browser
  - OS
  - Version
parameters:
  - [Chrome, Firefox, Safari]
  - [Windows, macOS, Linux]
  - [Latest, Previous, Legacy]
```

Or in object format:

```yaml
Browser:
  - Chrome
  - Firefox
  - Safari
OS:
  - Windows
  - macOS
  - Linux
Version:
  - Latest
  - Previous
  - Legacy
```

## Input Requirements

1. **Labels**: Must be unique strings identifying each parameter
2. **Parameters**: Each parameter must have:
   - At least one value
   - Unique values (no duplicates within a parameter)
   - Non-empty string values
3. **Array lengths**: `labels.length` must equal `parameters.length`

## Using the Tool

### 1. Editor Tab

The visual editor allows you to:
- Add/remove parameters
- Edit parameter names
- Add/remove values for each parameter
- See your configuration in a structured format

### 2. JSON/YAML Tab

Use this tab to:
- Paste existing JSON or YAML configurations
- Bulk edit parameters
- Format JSON for readability
- Convert between object and array formats

### 3. Examples Tab

Pre-built examples to get started:
- **Car Colors**: Simple 3-parameter example
- **Browser & OS**: Web compatibility testing scenario
- **10x10**: Large dataset with 10 parameters

### 4. Help Tab

In-tool documentation and resources

## Generating Test Cases

1. Configure your parameters using any of the input methods
2. Click "Generate Pairwise Combinations"
3. View the generated test cases in a table
4. Export or copy the results

## Exporting Results

### CSV Export

Click "Export CSV" to download a CSV file containing:
- Header row with parameter names
- Optional counter column (toggle with checkbox)
- One row per test case

Example CSV output:

```csv
#,Browser,OS,Version
1,Chrome,Windows,Latest
2,Firefox,macOS,Previous
3,Safari,Linux,Legacy
4,Chrome,macOS,Legacy
5,Firefox,Linux,Latest
6,Safari,Windows,Previous
...
```

### Copy to Clipboard

Use "Copy to Clipboard" to copy CSV data for pasting into:
- Spreadsheet applications (Excel, Google Sheets)
- Test management tools
- Documentation
- Issue trackers

## Integration with Testing Frameworks

### Using CSV Output in Test Automation

The generated CSV can be consumed by most test frameworks:

#### Python + pytest

```python
import csv
import pytest

def load_test_cases(filename):
    with open(filename) as f:
        reader = csv.DictReader(f)
        return [row for row in reader]

@pytest.mark.parametrize("test_case", load_test_cases("pairwise-tests.csv"))
def test_application(test_case):
    browser = test_case['Browser']
    os = test_case['OS']
    version = test_case['Version']
    # Your test logic here
```

#### JavaScript + Jest

```javascript
const fs = require('fs');
const csv = require('csv-parser');

const testCases = [];
fs.createReadStream('pairwise-tests.csv')
  .pipe(csv())
  .on('data', (row) => testCases.push(row))
  .on('end', () => {
    testCases.forEach((testCase) => {
      test(`Test: ${testCase.Browser} on ${testCase.OS}`, () => {
        // Your test logic
      });
    });
  });
```

#### Gherkin/Cucumber

```gherkin
Feature: Browser Compatibility

  Scenario Outline: Test on different configurations
    Given I am using <Browser>
    And I am on <OS>
    When I test with version <Version>
    Then the application should work correctly

    Examples:
      | Browser | OS      | Version  |
      | Chrome  | Windows | Latest   |
      | Firefox | macOS   | Previous |
      | Safari  | Linux   | Legacy   |
      # ... paste remaining rows from CSV
```

## Algorithm Details

The All Pairs Generator uses a greedy algorithm that:

1. **Generates all pairs**: Creates a list of all possible 2-way combinations between parameters
2. **Iterative selection**: Builds test cases one at a time, selecting values that cover the most uncovered pairs
3. **Coverage verification**: Continues until all pairs are covered at least once
4. **Optimization**: Minimizes the number of test cases while guaranteeing 100% pair coverage

### Coverage Guarantee

The algorithm ensures that for any two parameters, every possible combination of their values appears in at least one test case.

### Complexity

- **Input**: n parameters with k values each
- **All pairs count**: n × (n-1) / 2 × k²
- **Typical output**: O(k²) test cases (much less than k^n exhaustive cases)
- **Generation time**: O(n × k² × iterations)

For practical use cases (n ≤ 20, k ≤ 20), generation is near-instantaneous.

## Limitations and Considerations

### What Pairwise Testing Does NOT Cover

1. **3-way or higher interactions**: Only 2-way combinations are guaranteed
2. **Dependencies**: Assumes parameters are independent (no invalid combinations)
3. **Constraints**: Cannot enforce business rules (e.g., "Linux only supports Firefox")
4. **Priority**: All parameters treated equally

### When to Use Pairwise Testing

**Good candidates:**
- Configuration testing (browsers, OS, devices)
- Input validation with multiple fields
- Compatibility matrices
- Feature combination testing

**Poor candidates:**
- Safety-critical systems requiring exhaustive testing
- Systems with strong parameter dependencies
- Scenarios requiring specific 3+ way interactions
- Sequential/workflow testing

### Adding Constraints

For constrained pairwise testing, consider:
1. Generate full pairwise set
2. Filter out invalid combinations manually
3. Use specialized tools (PICT, ACTS) for constraint support

## Comparison with CLI Version

This web-based tool is inspired by the [AllPairs CLI](https://github.com/stevenayal/allpairs) with these differences:

| Feature | Web Tool | CLI Tool |
|---------|----------|----------|
| Language | TypeScript | Python |
| Interface | Web UI | Command line |
| Input | JSON/YAML/Visual Editor | .py/.json/.yml files |
| Output | CSV download/clipboard | CSV file |
| Dependencies | None (100% web) | Python runtime |
| Platform | Any browser | Requires Python |

**Advantages of Web Tool:**
- No installation required
- Visual editor for easy parameter management
- Interactive examples
- Copy/paste friendly
- Dark mode support

**Advantages of CLI Tool:**
- Scriptable/automatable
- File-based workflow
- Integration with shell scripts
- Batch processing

## API Reference

### POST /api/labs/allpairs/generate

Generate pairwise combinations.

**Request:**
```json
{
  "labels": ["Param1", "Param2"],
  "parameters": [["A", "B"], ["X", "Y"]]
}
```

**Response:**
```json
{
  "headers": ["Param1", "Param2"],
  "rows": [
    ["A", "X"],
    ["B", "Y"],
    ["A", "Y"],
    ["B", "X"]
  ]
}
```

**Error Response:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "parameters[0]",
      "message": "Parameter must have at least one value"
    }
  ]
}
```

### POST /api/labs/allpairs/convert

Convert JSON/YAML text to normalized format.

**Request:**
```json
{
  "text": "Browser:\n  - Chrome\n  - Firefox"
}
```

**Response:**
```json
{
  "labels": ["Browser"],
  "parameters": [["Chrome", "Firefox"]]
}
```

## Resources

- **Pairwise Testing Introduction**: [pairwise.org](https://www.pairwise.org/)
- **Original CLI Tool**: [github.com/stevenayal/allpairs](https://github.com/stevenayal/allpairs)
- **Research Paper**: *Combinatorial Testing* by D. Richard Kuhn et al.
- **NIST Guide**: [Practical Combinatorial Testing](https://csrc.nist.gov/projects/automated-combinatorial-testing-for-software)

## Troubleshooting

### "Validation failed" error

- Check that all parameters have at least one value
- Ensure no duplicate values within a parameter
- Verify labels and parameters arrays have the same length

### Large datasets taking too long

- Current implementation handles up to 20 parameters with 20 values each
- For larger datasets, consider splitting into multiple test suites
- Contact support if you need enterprise-scale generation

### CSV export not working

- Check browser download settings
- Ensure pop-ups are not blocked
- Try using "Copy to Clipboard" as alternative

### Results not persisting

- Check that localStorage is enabled in your browser
- Clear browser cache if experiencing issues
- Use JSON/YAML tab to backup your configuration

## Support

For issues, feature requests, or questions:
- GitHub Issues: [aiquaa repository](https://github.com/stevenayal/aiquaa/issues)
- Documentation: [/docs/tools/allpairs](/docs/tools/allpairs)
- Contact: support@aiquaa.com
