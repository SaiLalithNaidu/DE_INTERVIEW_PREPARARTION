// Seed data for Data Engineer Interview Prep
// Covers Python, SQL, PySpark, Scenario-Based, Projects, AWS & Tools, etc.

export const SEED_SECTIONS = [
  { id: 'dashboard', name: 'Dashboard', icon: 'Home', isNav: true, isStudySection: false },
  { id: 'python', name: 'Python', icon: 'Code2', isNav: true, isStudySection: true, color: '#3b82f6' },
  { id: 'sql', name: 'SQL', icon: 'Database', isNav: true, isStudySection: true, color: '#10b981' },
  { id: 'pyspark', name: 'PySpark', icon: 'Sparkles', isNav: true, isStudySection: true, color: '#f59e0b' },
  { id: 'scenario', name: 'Scenario Based', icon: 'GitFork', isNav: true, isStudySection: true, color: '#ec4899' },
  { id: 'projects', name: 'Projects', icon: 'FolderGit2', isNav: true, isStudySection: true, color: '#8b5cf6' },
  { id: 'aws', name: 'AWS & Tools', icon: 'Cloud', isNav: true, isStudySection: true, color: '#06b6d4' },
  { id: 'mock', name: 'Mock Interview', icon: 'Video', isNav: true, isStudySection: false },
  { id: 'quiz', name: 'Practice & Quiz', icon: 'CheckCircle2', isNav: true, isStudySection: false },
  { id: 'progress', name: 'Progress', icon: 'BarChart2', isNav: true, isStudySection: false },
  { id: 'admin', name: 'Question Manage', icon: 'Settings', isNav: true, isStudySection: false }
];

export const SEED_TOPICS = [
  // Python topics
  { id: 'py-basics', sectionId: 'python', name: 'Basics' },
  { id: 'py-advanced', sectionId: 'python', name: 'Advanced' },
  { id: 'py-coding', sectionId: 'python', name: 'Coding' },
  { id: 'py-de', sectionId: 'python', name: 'Data Engineering' },

  // SQL topics
  { id: 'sql-basics', sectionId: 'sql', name: 'Basics' },
  { id: 'sql-window', sectionId: 'sql', name: 'Window Functions' },
  { id: 'sql-tuning', sectionId: 'sql', name: 'Performance Tuning' },
  { id: 'sql-modeling', sectionId: 'sql', name: 'Data Modeling' },

  // PySpark topics
  { id: 'spark-core', sectionId: 'pyspark', name: 'Architecture & Core' },
  { id: 'spark-df', sectionId: 'pyspark', name: 'DataFrames & SQL' },
  { id: 'spark-tuning', sectionId: 'pyspark', name: 'Optimization & Skew' },
  { id: 'spark-streaming', sectionId: 'pyspark', name: 'Structured Streaming' },

  // Scenario topics
  { id: 'sc-production', sectionId: 'scenario', name: 'Production Incidents' },
  { id: 'sc-pipeline', sectionId: 'scenario', name: 'Pipeline Design' },
  { id: 'sc-skew', sectionId: 'scenario', name: 'Data Skew & Memory' },

  // Projects topics
  { id: 'proj-batch', sectionId: 'projects', name: 'Batch Lakehouse' },
  { id: 'proj-realtime', sectionId: 'projects', name: 'Real-Time Streaming' },

  // AWS & Tools topics
  { id: 'aws-storage', sectionId: 'aws', name: 'S3 & Glue' },
  { id: 'aws-warehouse', sectionId: 'aws', name: 'Redshift & Snowflake' },
  { id: 'aws-orchestration', sectionId: 'aws', name: 'Airflow & Orchestration' }
];

export const SEED_QUESTIONS = [
  // 1. PYTHON QUESTIONS
  {
    id: 'py-q1',
    sectionId: 'python',
    topicId: 'py-basics',
    difficulty: 'Basics',
    question: 'What is Python, and why is it used in Data Engineering?',
    shortAnswer: 'Python is a high-level, interpreted, dynamically-typed language widely used in Data Engineering for building scalable ETL/ELT pipelines, data transformations, API integrations, and workflow orchestration with rich ecosystem support.',
    explanation: `Python has become the de facto standard programming language for modern data engineering. Its primary strengths lie in its readability, rapid development cycle, and immense ecosystem of big data and cloud libraries.

Key reasons Python dominates Data Engineering:
1. Universal Glue Code: Python effortlessly connects disparate systems — pulling data from REST APIs, validating schemas with Pydantic, transforming with Pandas or PySpark, and dumping into cloud data lakes (AWS S3, GCP GCS, Azure ADLS).
2. Deep Big Data Ecosystem: Native bindings to Apache Spark (PySpark), distributed computing (Ray, Dask), and workflow orchestrators (Apache Airflow, Prefect, Dagster).
3. Cloud SDKs: First-class SDKs such as Boto3 (AWS), google-cloud (GCP), and azure-storage-blob (Azure) simplify cloud infrastructure automation.
4. Data Format Interoperability: Native and high-speed libraries for Parquet (PyArrow), Avro, ORC, Delta Lake, CSV, and JSON.`,
    example: `# Real-Time Data Engineering ETL Example
import boto3
import pandas as pd
from io import StringIO

def extract_and_load_pipeline():
    # 1. Extract raw data from REST API or source CSV
    raw_data = """id,customer,amount,currency,tx_date
    101,Acme Corp,1450.50,USD,2026-03-01
    102,Stark Ind,9800.00,USD,2026-03-01
    103,Wayne Ent,3200.75,EUR,2026-03-02"""
    
    df = pd.read_csv(StringIO(raw_data))
    
    # 2. Transform: Clean and Standardize to USD
    df['amount_usd'] = df.apply(lambda r: r['amount'] * 1.08 if r['currency'] == 'EUR' else r['amount'], axis=1)
    df['processed_at'] = pd.Timestamp.utcnow()
    
    # 3. Load: Write optimized Parquet output to S3 Data Lake
    s3 = boto3.client('s3')
    parquet_buffer = df.to_parquet(index=False)
    print(f"Pipeline successfully transformed {len(df)} records for target lakehouse.")

extract_and_load_pipeline()`,
    code: `import boto3
import pandas as pd

# Standard Python Data Engineering Pattern
def etl_handler(event, context):
    s3 = boto3.client('s3')
    # Read raw parquet from landing bucket
    obj = s3.get_object(Bucket='landing-zone', Key='transactions/2026-03-01.parquet')
    df = pd.read_parquet(obj['Body'])
    
    # Deduplicate and calculate metric
    clean_df = df.drop_duplicates(subset=['id']).dropna()
    clean_df['ingestion_time'] = pd.Timestamp.now()
    
    # Write to Curated Zone
    clean_df.to_parquet('s3://curated-zone/transactions/')
    return {"status": "SUCCESS", "rows_written": len(clean_df)}`,
    takeaways: [
      'Python is the primary language for building scalable ETL/ELT pipelines and pipeline automation.',
      'Core libraries include Pandas for in-memory wrangling, PySpark for petabyte-scale distributed compute, and Boto3 for cloud interaction.',
      'Used across the modern data stack for orchestration (Airflow, Dagster), transformation (dbt-python), and data ingestion.'
    ],
    infographicData: {
      title: "What is Python, and why is it used in Data Engineering?",
      category: "Python • Basics",
      cards: [
        {
          id: 'what',
          title: "What is Python?",
          type: "concept",
          color: "blue",
          bullets: [
            "Python is a high-level, interpreted, and easy-to-learn programming language.",
            "It has a simple and readable syntax which helps to write and maintain code quickly.",
            "Dynamic typing and interactive REPL allow fast prototyping of transformation logic."
          ]
        },
        {
          id: 'why',
          title: "Why used in Data Engineering?",
          type: "reasons",
          color: "green",
          bullets: [
            "Used for building robust ETL/ELT pipelines.",
            "Handles multi-structured formats (CSV, JSON, Parquet, Avro).",
            "Powers big data distributed processing via PySpark.",
            "Rich ecosystem of libraries (Pandas, NumPy, Boto3, PyArrow).",
            "Native integration with cloud services (AWS, GCP, Azure)."
          ]
        },
        {
          id: 'libraries',
          title: "Key Libraries",
          type: "list",
          color: "purple",
          items: [
            { name: "Pandas", desc: "Data analysis & tabular transformation" },
            { name: "PySpark", desc: "Large-scale distributed data processing" },
            { name: "Boto3", desc: "Work with AWS services (S3, Glue, Athena)" },
            { name: "Requests", desc: "REST API ingestion & webhooks" },
            { name: "Airflow", desc: "DAG workflow scheduling & orchestration" }
          ]
        },
        {
          id: 'example',
          title: "Real-time Example",
          type: "pipeline",
          color: "amber",
          flow: [
            { label: "Source", sub: "CSV / REST API", icon: "FileSpreadsheet", color: "green" },
            { label: "Python ETL", sub: "Clean, Transform, Validate", icon: "Code2", color: "blue" },
            { label: "AWS S3", sub: "Parquet Lakehouse", icon: "Database", color: "red" }
          ]
        },
        {
          id: 'takeaways',
          title: "Key Interview Takeaways",
          type: "takeaways",
          color: "violet",
          bullets: [
            "Python is the main programming language for ETL and automation in Data Engineering.",
            "Widely chosen due to simplicity, rich libraries, and first-class cloud integration.",
            "Enables building scalable, maintainable, and production-ready data pipelines."
          ]
        }
      ]
    },
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'py-q2',
    sectionId: 'python',
    topicId: 'py-basics',
    difficulty: 'Basics',
    question: 'What are the different data types in Python?',
    shortAnswer: 'Python provides built-in data types: Numeric (int, float, complex), Sequence (str, list, tuple), Mapping (dict), Set types (set, frozenset), Boolean (bool), and Binary (bytes, bytearray).',
    explanation: `In Data Engineering, understanding Python data types is critical for memory optimization, schema enforcement, and preventing runtime type-coercion errors during data ingestion.

1. Numeric:
   - int: Arbitrary precision integers (e.g., transaction counts).
   - float: IEEE 754 double-precision numbers (e.g., prices, coordinates).
2. Sequences:
   - str: Immutable unicode strings (e.g., customer names, IDs).
   - list: Mutable ordered sequences (e.g., batch buffers).
   - tuple: Immutable ordered sequences, hashable, memory-efficient.
3. Mappings:
   - dict: Key-value hash tables, used for JSON payloads and lookup tables.
4. Set Types:
   - set: Unordered unique collection (e.g., deduplicating primary keys).
5. NoneType:
   - None: Represents null values, essential when mapping to SQL NULL or Parquet missing values.`,
    example: `# Data Engineering Type Mapping & Memory Footprint
import sys

# Tuple vs List memory efficiency
sample_tuple = (101, 'NY', 450.50)
sample_list = [101, 'NY', 450.50]

print(f"Tuple size: {sys.getsizeof(sample_tuple)} bytes")
print(f"List size: {sys.getsizeof(sample_list)} bytes")

# Deduplicating primary keys using set
record_ids = [101, 102, 103, 101, 104, 102]
unique_ids = set(record_ids)
print(f"Unique records: {unique_ids}")`,
    code: `# Schema casting for incoming API batch
def enforce_types(record: dict) -> dict:
    return {
        "user_id": int(record["user_id"]),
        "email": str(record["email"]).strip().lower(),
        "amount": float(record["amount"]),
        "is_active": bool(record.get("is_active", True)),
        "tags": set(record.get("tags", []))
    }`,
    takeaways: [
      'Choose tuples over lists for read-only rows to save memory and ensure hashability.',
      'Sets provide O(1) membership testing, ideal for deduplication pipelines.',
      'Always sanitize and cast untyped payloads (JSON, CSV) early in the ingestion layer.'
    ],
    infographicData: {
      title: "Python Data Types in Data Engineering",
      category: "Python • Basics",
      cards: [
        {
          id: 'categories',
          title: "Core Data Type Hierarchy",
          type: "concept",
          color: "blue",
          bullets: [
            "Numeric: int, float, complex",
            "Sequences: str, list, tuple, range",
            "Mapping: dict (hash tables for JSON)",
            "Set types: set, frozenset (deduplication)"
          ]
        },
        {
          id: 'de_impact',
          title: "Impact on Data Engineering",
          type: "reasons",
          color: "green",
          bullets: [
            "Lists vs Tuples: Tuples use less memory; ideal for immutable row records.",
            "Dictionaries: Used to represent JSON/NoSQL document formats.",
            "Sets: Provide O(1) fast lookups and key deduplication.",
            "None vs NaN: Crucial to distinguish between Python None and Pandas/NumPy NaN."
          ]
        },
        {
          id: 'takeaways',
          title: "Key Takeaways",
          type: "takeaways",
          color: "violet",
          bullets: [
            "Tuples are immutable; lists are dynamic and resizable.",
            "Dict lookups are O(1) average time complexity.",
            "Strict type casting prevents downstream lakehouse partition corrupted schemas."
          ]
        }
      ]
    },
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'py-q3',
    sectionId: 'python',
    topicId: 'py-basics',
    difficulty: 'Basics',
    question: 'Difference between mutable and immutable objects?',
    shortAnswer: 'Mutable objects can be modified after creation without changing their memory address (lists, dicts, sets). Immutable objects cannot be altered; any change creates a new object in memory (int, float, str, tuple, frozenset).',
    explanation: `Understanding mutability is crucial in concurrent data pipelines, multiprocessing, and Spark worker tasks.

- Mutable Objects:
  * Types: list, dict, set, bytearray.
  * Passed by object reference. If modified inside a worker function, the change affects the original caller if not explicitly copied.
  * Cannot be used as dictionary keys or set elements (unhashable).

- Immutable Objects:
  * Types: int, float, bool, str, tuple, frozenset.
  * Thread-safe and safe for sharing across multiprocessing forks without lock contention.
  * Hashable (can serve as dictionary keys and set members).`,
    example: `# Mutable trap in batch processing
def append_timestamp(batch, default_tags=[]): # DANGEROUS default mutable argument!
    default_tags.append("processed")
    return default_tags

# Correct approach:
def safe_batch_tagging(batch, tags=None):
    if tags is None:
        tags = []
    tags.append("processed")
    return tags`,
    code: `# Checking memory identity with id()
str_val = "lakehouse"
orig_id = id(str_val)
str_val += "_v2"
print(orig_id == id(str_val))  # False: new object created!

list_val = [1, 2]
orig_list_id = id(list_val)
list_val.append(3)
print(orig_list_id == id(list_val))  # True: modified in place!`,
    takeaways: [
      'Never use mutable default arguments (e.g. def fn(arg=[])) in pipeline functions.',
      'Immutable types are hashable, making them valid dictionary keys and join anchors.',
      'In multi-threaded pipelines, immutable data prevents race conditions.'
    ],
    infographicData: {
      title: "Mutable vs Immutable Objects in Python",
      category: "Python • Basics",
      cards: [
        {
          id: 'mutable',
          title: "Mutable (In-place Changes)",
          type: "concept",
          color: "amber",
          bullets: [
            "Types: list, dict, set, bytearray",
            "Memory address remains identical after update",
            "Cannot be used as dict keys (unhashable)",
            "Risk of unintended side-effects in worker loops"
          ]
        },
        {
          id: 'immutable',
          title: "Immutable (Read-only / New Alloc)",
          type: "concept",
          color: "blue",
          bullets: [
            "Types: int, float, str, tuple, frozenset, bool",
            "Modifications always create a brand new object",
            "Hashable: Safe for dictionary keys and set elements",
            "Naturally thread-safe in concurrent ETL jobs"
          ]
        }
      ]
    },
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'py-q4',
    sectionId: 'python',
    topicId: 'py-advanced',
    difficulty: 'Advanced',
    question: 'What are *args and **kwargs?',
    shortAnswer: '*args passes variable positional arguments as a tuple. **kwargs passes variable keyword arguments as a dictionary. They are essential for writing flexible ETL decorators, pipeline wrappers, and cloud hooks.',
    explanation: `In production data frameworks like Apache Airflow, dbt plugins, or custom logging decorators, functions frequently wrap user jobs whose signatures vary.

- *args (Positional Varargs):
  * Unpacks extra positional arguments into a tuple.
  * Useful for passing arbitrary column names into a transformation function.

- **kwargs (Keyword Varargs):
  * Unpacks extra named arguments into a dictionary.
  * Heavily used in Airflow operators to capture execution context (e.g., ds, execution_date, params).`,
    example: `# Airflow custom task decorator using *args and **kwargs
import time
import functools

def pipeline_retry_logger(retries=3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    print(f"Attempt {attempt} failed: {e}")
                    if attempt == retries:
                        raise
                    time.sleep(1)
        return wrapper
    return decorator`,
    code: `def transform_columns(df, *col_names, **metadata):
    print(f"Applying transforms to columns: {col_names}")
    print(f"Job metadata: {metadata}")
    for col in col_names:
        df[col] = df[col].astype(str).str.strip()
    return df`,
    takeaways: [
      '*args unpacks to a tuple; **kwargs unpacks to a dictionary.',
      'Standard pattern for Airflow custom operators, decorators, and database connection wrappers.',
      'Enables high reusability across data platform libraries.'
    ],
    infographicData: {
      title: "Understanding *args and **kwargs in Python",
      category: "Python • Advanced",
      cards: [
        {
          id: 'args',
          title: "*args (Positional Arguments)",
          type: "concept",
          color: "blue",
          bullets: [
            "Receives arbitrary number of positional arguments as a tuple.",
            "Example: def ingest_tables(*tables) -> ('orders', 'users')",
            "Allows dynamic column list passing without fixed signatures."
          ]
        },
        {
          id: 'kwargs',
          title: "**kwargs (Keyword Arguments)",
          type: "concept",
          color: "purple",
          bullets: [
            "Receives variable named arguments as a dictionary.",
            "Example: def connect_db(**credentials) -> {'host': '...', 'port': 5432}",
            "Foundation of Airflow execution context and cloud client configurations."
          ]
        }
      ]
    },
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'py-q5',
    sectionId: 'python',
    topicId: 'py-advanced',
    difficulty: 'Advanced',
    question: 'What is a generator in Python?',
    shortAnswer: 'A generator is a function that produces a sequence of values lazily using the yield statement instead of return. It maintains its state between yields and uses O(1) memory, making it ideal for processing gigabyte-sized CSVs or streaming logs.',
    explanation: `When processing massive data files on memory-constrained containers (such as AWS ECS or Kubernetes pods), loading an entire 10GB file with readlines() or pd.read_csv() causes Out of Memory (OOM) kills.

Generators solve this via lazy evaluation:
- Only one record or chunk is kept in RAM at any given millisecond.
- State is preserved between yield statements.
- Implements the iterator protocol (__iter__ and __next__) automatically.`,
    example: `# Streaming multi-gigabyte log files line by line
def stream_large_log_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            if 'ERROR' in line or 'FATAL' in line:
                yield line.strip()

# Pipeline consumer: uses constant O(1) memory
for error_log in stream_large_log_file('s3_server_access.log'):
    publish_to_slack_alert(error_log)`,
    code: `# Generator Expression vs List Comprehension Memory Test
import sys

# List comprehension: loads everything into RAM immediately
list_comp = [x * 2 for x in range(1_000_000)]

# Generator expression: generates on the fly
gen_exp = (x * 2 for x in range(1_000_000))

print(f"List comprehension size: {sys.getsizeof(list_comp)} bytes")  # ~8.4 MB
print(f"Generator expression size: {sys.getsizeof(gen_exp)} bytes")   # ~104 bytes!`,
    takeaways: [
      'Generators evaluate lazily on-demand using yield.',
      'Memory footprint is O(1) regardless of dataset scale.',
      'Indispensable for chunked stream processing, API pagination, and huge file parsing.'
    ],
    infographicData: {
      title: "Generators & Lazy Evaluation in Python",
      category: "Python • Advanced",
      cards: [
        {
          id: 'concept',
          title: "How Generators Work",
          type: "concept",
          color: "green",
          bullets: [
            "Uses 'yield' keyword instead of 'return'.",
            "Pauses execution and yields control back to consumer.",
            "Resumes execution right after the yield when next() is called."
          ]
        },
        {
          id: 'memory',
          title: "Memory Comparison (1 Million Records)",
          type: "reasons",
          color: "blue",
          bullets: [
            "List in RAM: ~8,448,728 bytes (Eager loading).",
            "Generator in RAM: ~104 bytes (Lazy on-demand).",
            "Prevents container OOM kills in AWS Fargate / K8s worker pods."
          ]
        }
      ]
    },
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'py-q6',
    sectionId: 'python',
    topicId: 'py-advanced',
    difficulty: 'Advanced',
    question: 'Iterable vs Iterator vs Generator?',
    shortAnswer: 'An Iterable is any object with an __iter__() method (list, tuple). An Iterator is an object with __next__() returning values one by one. A Generator is a concise way to create an Iterator using the yield keyword.',
    explanation: `Distinction summary:
1. Iterable: Anything you can loop over with a for loop. Examples: list, str, dict, file handler. Implements __iter__().
2. Iterator: The stateful object traversing an iterable. Implements __next__() and raises StopIteration when depleted.
3. Generator: A lightweight syntax (using yield or (x for x in y)) that automatically creates an iterator without writing boilerplate classes.`,
    example: `numbers = [10, 20, 30]  # Iterable
iterator_obj = iter(numbers)  # Iterator

print(next(iterator_obj))  # 10
print(next(iterator_obj))  # 20
print(next(iterator_obj))  # 30
# next(iterator_obj) -> raises StopIteration!`,
    code: `class CustomBatchIterator:
    """Manual Iterator implementation for database chunks"""
    def __init__(self, limit=100):
        self.limit = limit
        self.current = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.current < self.limit:
            self.current += 1
            return f"batch_offset_{self.current * 1000}"
        raise StopIteration`,
    takeaways: [
      'All Generators are Iterators; all Iterators are Iterables.',
      'Calling iter() on an Iterable returns an Iterator.',
      'Generators are the most Pythonic way to produce custom iterators.'
    ],
    infographicData: {
      title: "Iterable vs Iterator vs Generator Relationship",
      category: "Python • Advanced",
      cards: [
        {
          id: 'venn',
          title: "Relationship Venn Structure",
          type: "concept",
          color: "purple",
          bullets: [
            "Iterable (Outer): Has __iter__(), e.g. list, dict, set.",
            "Iterator (Middle): Has __next__(), remembers current pointer.",
            "Generator (Inner): Written with yield, builds iterators concisely."
          ]
        }
      ]
    },
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'py-q7',
    sectionId: 'python',
    topicId: 'py-basics',
    difficulty: 'Basics',
    question: 'What is a Python module and package?',
    shortAnswer: 'A module is a single .py file containing reusable functions, classes, and variables. A package is a directory containing multiple modules and an __init__.py file that enables dot-notation imports.',
    explanation: `In production codebases, modular organization separates ingestion, business transformations, and database connectors.

- Module: A file named math_utils.py. Imported as import math_utils.
- Package: A folder named pipelines/ containing __init__.py, extract.py, transform.py, load.py. Imported as from pipelines.transform import clean_dates.`,
    example: `my_data_platform/
├── __init__.py
├── connectors/
│   ├── __init__.py
│   ├── s3.py
│   └── snowflake.py
└── transforms/
    ├── __init__.py
    └── currency.py`,
    code: `# Inside pipelines/transforms/currency.py
def convert_to_usd(amount, rate):
    return round(amount * rate, 2)

# Inside main ETL script
from pipelines.transforms.currency import convert_to_usd
from pipelines.connectors.snowflake import get_snowflake_conn`,
    takeaways: [
      'Modules group related functions into individual files.',
      'Packages structure complex multi-layer data pipelines into clean namespaces.',
      '__init__.py signals to Python that a directory is an importable package.'
    ],
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'py-q8',
    sectionId: 'python',
    topicId: 'py-advanced',
    difficulty: 'Advanced',
    question: 'How does Python import work?',
    shortAnswer: 'When importing a module, Python searches sys.modules cache first, then built-in modules, and finally directories listed in sys.path. Once located, it compiles to bytecode (.pyc), executes top-level code, and binds the name to the local namespace.',
    explanation: `Step-by-step import resolution:
1. sys.modules check: Avoids re-evaluating already loaded modules.
2. Built-in modules: Searches C-level compiled built-ins (e.g., sys, time).
3. sys.path search: Current working directory, PYTHONPATH environment variable paths, and site-packages (pip installed packages).
4. Compilation: If a .py file is found, it compiles to __pycache__/*.pyc bytecode.
5. Execution: Executes all top-level statements and stores the module object in sys.modules.`,
    example: `import sys

# Inspect the search order in your ETL runner container
for idx, path in enumerate(sys.path):
    print(f"[{idx}] {path}")`,
    code: `# Dynamically loading a data connector plugin
import importlib

def load_connector(connector_name: str):
    module = importlib.import_module(f"connectors.{connector_name}")
    return module.Connector()`,
    takeaways: [
      'sys.modules caches loaded modules; subsequent imports are O(1) lookups.',
      'Always configure PYTHONPATH in Dockerfiles or Airflow environments to resolve custom modules.',
      'Avoid circular imports by importing within functions or refactoring shared dependencies.'
    ],
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'py-q9',
    sectionId: 'python',
    topicId: 'py-basics',
    difficulty: 'Basics',
    question: 'What is exception handling in Python?',
    shortAnswer: 'Exception handling in Python manages runtime errors gracefully using try, except, else, and finally blocks, preventing unexpected pipeline termination and enabling automated retries and dead-letter queue (DLQ) alerts.',
    explanation: `In production ETL pipelines, data quality anomalies, transient network timeouts, and database connection drops will occur.

- try: Code that may raise an error (e.g. database query, S3 download).
- except: Handles specific exceptions (e.g., ClientError, KeyError).
- else: Runs only if no exception occurred.
- finally: Always runs, ideal for releasing resources like database connections or temporary files.`,
    example: `# Robust database extraction with resource cleanup
import psycopg2

def extract_safely():
    conn = None
    try:
        conn = psycopg2.connect("dbname=analytics user=de_user")
        cur = conn.cursor()
        cur.execute("SELECT * FROM raw_events LIMIT 1000;")
        return cur.fetchall()
    except psycopg2.DatabaseError as db_err:
        print(f"Database error during extraction: {db_err}")
        send_to_dead_letter_queue("raw_events_failure")
        raise
    finally:
        if conn:
            conn.close()
            print("Postgres connection cleanly closed.")`,
    code: `# Custom Data Engineering Exception
class SchemaMismatchException(Exception):
    """Raised when incoming JSON payload violates parquet contract"""
    pass

def validate_schema(payload: dict, required_keys: set):
    missing = required_keys - payload.keys()
    if missing:
        raise SchemaMismatchException(f"Missing required fields: {missing}")`,
    takeaways: [
      'Never catch bare except: or Exception without logging the stack trace.',
      'Use finally blocks to guarantee cleanup of network sockets, file handlers, and DB pools.',
      'Fail fast and route corrupted records to a Dead Letter Queue (DLQ) rather than failing entire multi-hour batches.'
    ],
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'py-q10',
    sectionId: 'python',
    topicId: 'py-coding',
    difficulty: 'Coding',
    question: 'Explain list comprehension with an example.',
    shortAnswer: 'List comprehension provides a concise syntax for creating a new list from an existing iterable, formatted as [expression for item in iterable if condition]. It is faster than standard for-loops due to C-level bytecode optimization.',
    explanation: `List comprehensions are widely used in Python ETL scripts for sanitizing record batches, filtering invalid timestamps, and extracting nested dictionary values.

Syntax:
[expression for item in iterable if condition]

Advantages:
- More concise and readable than multi-line loops.
- Executes faster in CPython because iteration runs in optimized C bytecode.
- Can be nested for matrix/flattening operations.`,
    example: `# Data Engineering Cleaning Example
raw_salaries = ["$120,000", "$95,500", "INVALID", "$140,000", "N/A"]

clean_salaries = [
    float(s.replace('$', '').replace(',', ''))
    for s in raw_salaries
    if s.startswith('$')
]
print(clean_salaries)  # [120000.0, 95500.0, 140000.0]`,
    code: `# Flattening nested JSON partition batches
partitions = [
    {"date": "2026-03-01", "files": ["f1.parquet", "f2.parquet"]},
    {"date": "2026-03-02", "files": ["f3.parquet", "f4.parquet"]}
]

all_files = [f for p in partitions for f in p["files"]]
print(all_files) # ['f1.parquet', 'f2.parquet', 'f3.parquet', 'f4.parquet']`,
    takeaways: [
      'Use list comprehension for simple transformations and filtering.',
      'For massive datasets (millions of rows), prefer generator expressions (x for x in y) to save memory.',
      'Avoid overly nested comprehensions (more than 2 loops) to maintain code readability.'
    ],
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },

  // 2. SQL QUESTIONS
  {
    id: 'sql-q1',
    sectionId: 'sql',
    topicId: 'sql-window',
    difficulty: 'Intermediate',
    question: 'What are SQL Window Functions and how do ROW_NUMBER, RANK, and DENSE_RANK differ?',
    shortAnswer: 'Window functions perform calculations across a set of table rows related to the current row without collapsing them into a single row like GROUP BY. ROW_NUMBER assigns unique sequential integers, RANK skips numbers on ties, and DENSE_RANK does not skip numbers on ties.',
    explanation: `Window functions are essential in Data Engineering for deduplication, running totals, sessionization, and Top-N queries.

Syntax:
FUNCTION() OVER (PARTITION BY col1 ORDER BY col2 [ROWS/RANGE ...])

Difference on ties (e.g. values 100, 100, 90):
- ROW_NUMBER(): 1, 2, 3 (Arbitrary unique numbering)
- RANK(): 1, 1, 3 (Gaps after ties)
- DENSE_RANK(): 1, 1, 2 (No gaps after ties)`,
    example: `-- Deduplicating incremental CDC records (Keep latest state)
WITH RankedRecords AS (
    SELECT 
        customer_id,
        email,
        updated_at,
        ROW_NUMBER() OVER (
            PARTITION BY customer_id 
            ORDER BY updated_at DESC
        ) as rn
    FROM staging_customers
)
SELECT customer_id, email, updated_at
FROM RankedRecords
WHERE rn = 1;`,
    code: `SELECT 
    dept_id,
    emp_name,
    salary,
    ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) as row_num,
    RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) as rnk,
    DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) as dense_rnk
FROM employees;`,
    takeaways: [
      'Window functions preserve row-level granularity while calculating group-level metrics.',
      'ROW_NUMBER() OVER (PARTITION BY id ORDER BY ts DESC) WHERE rn = 1 is the standard pattern for idempotently deduplicating CDC feeds.',
      'Use DENSE_RANK() when calculating Nth highest values without missing ranks.'
    ],
    infographicData: {
      title: "SQL Window Functions: ROW_NUMBER vs RANK vs DENSE_RANK",
      category: "SQL • Window Functions",
      cards: [
        {
          id: 'rank_diff',
          title: "Tie Breaking Behavior (Values: 100, 100, 90)",
          type: "concept",
          color: "blue",
          bullets: [
            "ROW_NUMBER(): Assigns 1, 2, 3 (Strict sequential, no ties preserved).",
            "RANK(): Assigns 1, 1, 3 (Ties get same rank, subsequent rank skips).",
            "DENSE_RANK(): Assigns 1, 1, 2 (Ties get same rank, no gaps in sequence)."
          ]
        },
        {
          id: 'de_use_cases',
          title: "Common Data Engineering Use Cases",
          type: "reasons",
          color: "green",
          bullets: [
            "De-duplicating CDC (Change Data Capture) logs using rn = 1.",
            "Calculating Running totals & moving averages via SUM() OVER ().",
            "Lead & Lag analysis for calculating session duration and state changes."
          ]
        }
      ]
    },
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'sql-q2',
    sectionId: 'sql',
    topicId: 'sql-tuning',
    difficulty: 'Advanced',
    question: 'How do you optimize a slow-running SQL query on a Big Data warehouse (Snowflake/Redshift)?',
    shortAnswer: 'Analyze the Query Execution Plan (EXPLAIN), prune micro-partitions / distribute keys properly to eliminate full table scans, replace SELECT * with required columns, avoid Cartesian joins, pre-aggregate intermediate data, and leverage materialized views or clustering keys.',
    explanation: `Optimization checklist for OLAP warehouses:
1. Partition / Clustering Pruning: Ensure WHERE filters match clustering keys or partition keys so the engine skips irrelevant files.
2. Distribution & Sort Keys (Redshift): Align join keys with distribution keys (KEY distribution) to avoid expensive network broadcast/redistribution steps.
3. Spilling to Local/Remote Disk: Occurs when warehouse memory is insufficient for large sorts/aggregations. Increase compute cluster size or pre-filter datasets.
4. Avoid Non-SARGable Queries: Avoid wrapping indexed columns in functions like WHERE YEAR(order_date) = 2026. Use WHERE order_date >= '2026-01-01' AND order_date < '2027-01-01'.`,
    example: `-- Bad (Non-SARGable, scans entire table):
SELECT customer_id FROM orders WHERE DATE(created_at) = '2026-03-01';

-- Optimized (Enables partition pruning):
SELECT customer_id FROM orders 
WHERE created_at >= '2026-03-01 00:00:00' 
  AND created_at < '2026-03-02 00:00:00';`,
    code: `-- Redshift Distribution Key Alignment
CREATE TABLE sales_fact (
    order_id BIGINT,
    customer_id INT,
    amount DECIMAL(12,2),
    order_date DATE
)
DISTSTYLE KEY
DISTKEY(customer_id)
SORTKEY(order_date);`,
    takeaways: [
      'Always inspect the Query Execution Plan for disk spilling and broadcast operations.',
      'Never use SELECT *; column pruning directly reduces S3 I/O and network transfer costs.',
      'SARGable WHERE predicates enable partition pruning and metadata skipping.'
    ],
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },

  // 3. PYSPARK QUESTIONS
  {
    id: 'spark-q1',
    sectionId: 'pyspark',
    topicId: 'spark-core',
    difficulty: 'Basics',
    question: 'What is the difference between RDD, DataFrame, and Dataset in Apache Spark?',
    shortAnswer: 'RDD is the low-level resilient distributed dataset without schema optimizations. DataFrame is a distributed collection of rows organized into named columns optimized by Catalyst Optimizer and Tungsten engine. Dataset is strongly-typed (Scala/Java only).',
    explanation: `Spark Evolution:
1. RDD (Resilient Distributed Dataset):
   - Spark 1.0 foundational abstraction.
   - Low-level control, functional transformations (map, flatMap, reduceByKey).
   - Drawback: Python-to-JVM serialization overhead via Py4J, no query plan optimization.
2. DataFrame:
   - Spark 2.0+ primary API.
   - High-level SQL relational API.
   - Optimized by Catalyst Optimizer (logical/physical plan generation) and Tungsten execution engine (off-heap memory and binary encoding).
   - Identical performance between PySpark and Scala.
3. Dataset:
   - Type-safe object mapping (compile-time safety). Available only in Scala and Java. In Python, DataFrame is an alias for Dataset[Row].`,
    example: `# PySpark DataFrame: Optimized by Catalyst Engine
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum

spark = SparkSession.builder.appName("DE_Optimization").getOrCreate()

df = spark.read.parquet("s3a://lakehouse/orders/")
summary = (
    df.filter(col("status") == "COMPLETED")
      .groupBy("customer_id")
      .agg(sum("total_amount").alias("revenue"))
)
# View optimized query execution plan
summary.explain(True)`,
    code: `# RDD vs DataFrame syntax comparison
# RDD Approach (Slow in PySpark due to Python serialization)
rdd_res = rdd.filter(lambda x: x['status'] == 'COMPLETED').map(lambda x: (x['cust_id'], x['amount'])).reduceByKey(lambda a, b: a + b)

# DataFrame Approach (Fast, executed directly in JVM C++ Tungsten)
df_res = df.filter("status = 'COMPLETED'").groupBy("cust_id").sum("amount")`,
    takeaways: [
      'Always prefer DataFrames over RDDs in PySpark to leverage Catalyst and Tungsten optimizations.',
      'PySpark DataFrames run at native JVM speed because transformation plans are executed in Tungsten off-heap memory.',
      'Inspect physical plans using .explain(True) to spot Exchange (shuffles) and BroadcastHashJoins.'
    ],
    infographicData: {
      title: "Spark RDD vs DataFrame vs Dataset",
      category: "PySpark • Architecture",
      cards: [
        {
          id: 'comparison',
          title: "Architecture Comparison",
          type: "concept",
          color: "amber",
          bullets: [
            "RDD: Low-level API, no schema, high serialization overhead in PySpark.",
            "DataFrame: Structured tabular data, Catalyst Optimizer + Tungsten Engine.",
            "Dataset: Strongly-typed (Scala/Java only); in Python, DataFrame is Dataset[Row]."
          ]
        },
        {
          id: 'benefits',
          title: "Why DataFrames Win",
          type: "reasons",
          color: "green",
          bullets: [
            "Catalyst Optimizer optimizes join orders, filters, and projections.",
            "Tungsten stores data off-heap in compact binary format, avoiding GC pauses.",
            "Equal performance across Python, Scala, SQL, and R."
          ]
        }
      ]
    },
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'spark-q2',
    sectionId: 'pyspark',
    topicId: 'spark-tuning',
    difficulty: 'Advanced',
    question: 'How do you detect and resolve Data Skew in PySpark?',
    shortAnswer: 'Detect skew when one Spark task runs significantly longer than others in Spark UI. Resolve using Salting (adding random prefixes to skewed keys), Broadcast Joins for small lookup tables, Adaptive Query Execution (AQE), or repartitioning by high-cardinality keys.',
    explanation: `Data skew occurs when data is unevenly distributed across partitions due to high-frequency join/groupBy keys (e.g. NULLs, default dummy values, or mega-merchants).

Symptoms in Spark UI:
- 199 tasks finish in 5 seconds; 1 last task hangs for 45 minutes or crashes with OutOfMemory / FetchFailedException.

Resolution Techniques:
1. Salting: Append a random number (e.g., 0 to 9) to the skewed key in table A, and replicate matching rows 10 times in table B before joining.
2. Broadcast Join: If one table is under 100MB (default 10MB spark.sql.autoBroadcastJoinThreshold), broadcast it to all executors so no shuffle join occurs.
3. Enable Spark AQE: In Spark 3.x, set spark.sql.adaptive.enabled=true and spark.sql.adaptive.skewJoin.enabled=true. Spark automatically splits skewed partitions at runtime.
4. Filter or separate NULL keys: Separate NULL or default keys from the main join stream and union them back afterwards.`,
    example: `# Resolving Skew with Key Salting
from pyspark.sql.functions import col, concat, lit, rand, explode, array

# 1. Add random salt (0-9) to skewed table
salted_large_df = large_df.withColumn("salt", (rand() * 10).cast("int"))
salted_large_df = salted_large_df.withColumn("salted_join_key", concat(col("customer_id"), lit("_"), col("salt")))

# 2. Replicate lookup table keys 0-9
lookup_df_replicated = lookup_df.withColumn("salt_array", array([lit(i) for i in range(10)]))
lookup_df_replicated = lookup_df_replicated.withColumn("salt", explode("salt_array"))
lookup_df_replicated = lookup_df_replicated.withColumn("salted_join_key", concat(col("customer_id"), lit("_"), col("salt")))

# 3. Join on salted key (work is evenly distributed across 10x partitions!)
joined_df = salted_large_df.join(lookup_df_replicated, "salted_join_key")`,
    code: `# Enabling Adaptive Query Execution in Spark 3+
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", "5")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "268435456") # 256MB`,
    takeaways: [
      'In Spark UI, skew is identified when task duration distribution shows max time >> 75th percentile.',
      'Spark 3+ AQE automatically detects and splits skewed partitions without manual salting in many cases.',
      'Salting distributes high-frequency hot keys evenly across multiple executor slots.'
    ],
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },

  // 4. AWS & TOOLS QUESTIONS
  {
    id: 'aws-q1',
    sectionId: 'aws',
    topicId: 'aws-storage',
    difficulty: 'Intermediate',
    question: 'How do you design a cost-effective, high-performance Data Lakehouse on AWS S3?',
    shortAnswer: 'Store datasets in columnar formats (Parquet/ORC) with snappy compression, apply sensible partition keys (e.g. year/month/day), leverage S3 Lifecycle policies (Intelligent-Tiering, Glacier), and use open table formats (Delta Lake, Apache Iceberg) to enable ACID transactions and time travel.',
    explanation: `Best practices for modern AWS S3 Lakehouses:
1. File Format: Convert raw CSV/JSON to columnar Parquet or ORC. Parquet enables column projection skipping and predicate pushdown in Athena/EMR.
2. File Sizing: Avoid the Small Files Problem. Target individual parquet file sizes between 128 MB and 512 MB. Too many small files overwhelm metastores (AWS Glue) and generate millions of expensive S3 GET calls.
3. Partitioning: Partition by query-access patterns (e.g. event_date=YYYY-MM-DD). Avoid over-partitioning by high-cardinality keys like user_id.
4. Storage Tiers: Apply S3 Lifecycle rules to move raw landing data to S3 Intelligent-Tiering or Glacier Flexible Retrieval after 90 days.
5. Table Formats (Iceberg / Delta): Maintain metadata layers that prevent corrupted dirty reads during concurrent writes and provide ACID merge/upsert operations.`,
    example: `# Compacting small files in PySpark before S3 write
df = spark.read.json("s3://landing-bucket/streaming-events/*")

# Repartition to target ~128MB-256MB per partition
num_partitions = max(1, int(estimated_size_mb / 128))
(
    df.repartition(num_partitions, "event_date")
      .write
      .mode("append")
      .partitionBy("event_date")
      .format("parquet")
      .option("compression", "snappy")
      .save("s3://curated-lakehouse/events/")
)`,
    code: `# AWS Athena Partition Projection Configuration
ALTER TABLE lakehouse_db.customer_events SET TBLPROPERTIES (
  'projection.enabled'='true',
  'projection.event_date.type'='date',
  'projection.event_date.range'='2025-01-01,NOW',
  'projection.event_date.format'='yyyy-MM-dd',
  'storage.location.template'='s3://curated-lakehouse/events/event_date=\${event_date}'
);`,
    takeaways: [
      'Target file sizes of 128MB-512MB to avoid the small files problem.',
      'S3 Intelligent-Tiering automatically cuts storage costs for infrequently accessed partitions.',
      'Table formats like Apache Iceberg and Delta Lake eliminate S3 eventual consistency issues.'
    ],
    infographicData: {
      title: "AWS S3 Data Lakehouse Architecture",
      category: "AWS & Tools • S3 & Lakehouse",
      cards: [
        {
          id: 'zones',
          title: "Medallion Architecture (Bronze -> Silver -> Gold)",
          type: "concept",
          color: "blue",
          bullets: [
            "Bronze (Landing): Raw, immutable JSON/CSV feeds.",
            "Silver (Curated): Cleaned, deduplicated, columnar Parquet with schema enforcement.",
            "Gold (Analytics): Aggregated star-schemas for BI and machine learning."
          ]
        },
        {
          id: 'optimization',
          title: "S3 Performance Rules",
          type: "reasons",
          color: "green",
          bullets: [
            "File sizing: 128MB to 512MB per file.",
            "Compression: Snappy (fast decompression for compute engines).",
            "Partitioning: Date-based; avoid excessive granularity."
          ]
        }
      ]
    },
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },

  // 5. SCENARIO BASED QUESTIONS
  {
    id: 'sc-q1',
    sectionId: 'scenario',
    topicId: 'sc-pipeline',
    difficulty: 'Advanced',
    question: 'How do you design an Idempotent Data Pipeline that safely handles re-runs?',
    shortAnswer: 'An idempotent pipeline guarantees that running it multiple times on the same input produces the exact same output without duplicate records or side effects. This is achieved via partition overwrites, upsert/merge logic with primary keys, atomic stage swaps, and deterministic deduplication.',
    explanation: `In production, pipelines inevitably fail halfway due to spot instance termination, network drops, or bad source records. Without idempotency, re-running a job duplicates financial metrics or corrupts analytics.

Key Techniques:
1. Dynamic Partition Overwrite: Replace only the partition corresponding to the job execution date rather than appending.
2. Delta Lake / Iceberg MERGE: Use MERGE INTO target USING staging ON target.id = staging.id WHEN MATCHED THEN UPDATE WHEN NOT MATCHED THEN INSERT.
3. Atomic Swap / Staging Tables: Load into a temporary staging table, validate row counts and data contracts, then atomically swap: ALTER TABLE prod RENAME TO prod_old; ALTER TABLE stage RENAME TO prod;.
4. Deterministic Surrogate Keys: Generate IDs using hash algorithms like SHA256(concat(natural_key, event_timestamp)) instead of auto-incrementing integers.`,
    example: `-- Idempotent Delta Lake MERGE statement
MERGE INTO gold_customers AS target
USING (
    SELECT id, name, email, updated_at 
    FROM silver_staged_cdc
) AS source
ON target.id = source.id
WHEN MATCHED AND source.updated_at > target.updated_at THEN
    UPDATE SET 
        target.name = source.name,
        target.email = source.email,
        target.updated_at = source.updated_at
WHEN NOT MATCHED THEN
    INSERT (id, name, email, updated_at) 
    VALUES (source.id, source.name, source.email, source.updated_at);`,
    code: `# PySpark Dynamic Partition Overwrite
spark.conf.set("spark.sql.sources.partitionOverwriteMode", "dynamic")

(
    clean_df
      .write
      .mode("overwrite")
      .partitionBy("event_date")
      .parquet("s3://curated-zone/orders/")
)`,
    takeaways: [
      'Never rely on append-only logic for daily batch pipelines.',
      'Use MERGE INTO with unique business keys or dynamic partition overwrites.',
      'Airflow DAGs should be backfill-safe, taking logical execution_date as parameter rather than current system time.'
    ],
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },

  // 6. PROJECTS QUESTIONS
  {
    id: 'proj-q1',
    sectionId: 'projects',
    topicId: 'proj-batch',
    difficulty: 'Intermediate',
    question: 'Explain an End-to-End Batch Lakehouse Project you designed and deployed.',
    shortAnswer: 'Architected a multi-tier Medallion Lakehouse on AWS processing 100M+ daily events. Ingested raw source data into S3 via AWS Glue, transformed into Silver Parquet tables with PySpark on EMR, modeled into Gold star-schemas in Snowflake/Redshift, and orchestrated with Apache Airflow and dbt with automated Slack alerts.',
    explanation: `Project Architecture Walkthrough:
1. Ingestion Layer:
   - Event logs pushed from Kafka to S3 Bronze landing bucket via Kafka Connect S3 Sink.
   - Nightly database CDC snapshots extracted using AWS Glue.
2. Transformation Layer (Silver):
   - PySpark jobs running on AWS EMR Serverless perform schema validation, deduplication via window functions, and write to Delta Lake/Iceberg tables partitioned by date.
3. Serving Layer (Gold):
   - dbt models transform normalized silver tables into Dimensional Star Schema (Fact Orders, Dim Customer, Dim Product) loaded into Snowflake.
4. Orchestration & Monitoring:
   - Managed Apache Airflow (MWAA) triggers DAGs with SLA monitoring, Great Expectations data quality test checks, and PagerDuty webhooks for critical alert failures.`,
    example: `Architecture Flow:
[Kafka / RDBMS Sources] 
        │
        ▼ (Glue / Connect)
[AWS S3 Bronze Landing] (Raw JSON / Parquet)
        │
        ▼ (EMR PySpark Cleaning & Dedup)
[AWS S3 Silver Curated] (Delta Lake / Snappy)
        │
        ▼ (dbt Core Transformations)
[Snowflake / Redshift Gold] (Star Schema Facts & Dims)
        │
        ▼
[Power BI / Metabase / ML Models]`,
    code: `# Great Expectations Data Quality Test Task in Airflow DAG
from airflow.operators.python import PythonOperator

def run_data_contract_checks(**context):
    ds = context['ds']
    # Check null percentages and primary key uniqueness
    # Raises AirflowException if validation threshold fails
    validate_table_contracts(table="silver_transactions", partition=ds)

validate_task = PythonOperator(
    task_id="validate_data_contracts",
    python_callable=run_data_contract_checks,
    provide_context=True,
    dag=dag
)`,
    takeaways: [
      'Clearly articulate the business problem, data volume, architecture layers, and tech stack choices.',
      'Highlight data quality validation (Great Expectations or dbt tests) and automated alerts.',
      'Quantify results: e.g., reduced pipeline latency from 6 hours to 40 minutes, cut cloud cost by 35%.'
    ],
    active: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  }
];

// Initialize LocalStorage with seed data if not present
export function initializeStorageIfNeeded() {
  const initialized = localStorage.getItem('dep_initialized');
  if (!initialized) {
    localStorage.setItem('dep_sections', JSON.stringify(SEED_SECTIONS));
    localStorage.setItem('dep_topics', JSON.stringify(SEED_TOPICS));
    localStorage.setItem('dep_questions', JSON.stringify(SEED_QUESTIONS));
    localStorage.setItem('dep_bookmarks', JSON.stringify(['py-q1']));
    localStorage.setItem('dep_progress', JSON.stringify([]));
    localStorage.setItem('dep_initialized', 'true');
  }
}

