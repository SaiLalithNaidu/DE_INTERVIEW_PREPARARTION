// Workbook questions and clear text answers for sections beyond Python, SQL, and PySpark.

export const ADDITIONAL_TOPICS = [
  { id: 'scenario-python', sectionId: 'scenario', name: 'Python Scenarios' },
  { id: 'scenario-sql', sectionId: 'scenario', name: 'SQL Scenarios' },
  { id: 'scenario-pyspark', sectionId: 'scenario', name: 'PySpark Scenarios' },
  { id: 'projects-end-to-end', sectionId: 'projects', name: 'End-to-End Projects' },
  { id: 'production-incidents', sectionId: 'production', name: 'Production Troubleshooting' },
  { id: 'aws-s3', sectionId: 'aws', name: 'AWS S3' },
  { id: 'aws-iam', sectionId: 'aws', name: 'IAM' },
  { id: 'aws-glue', sectionId: 'aws', name: 'AWS Glue' },
  { id: 'aws-athena', sectionId: 'aws', name: 'Athena' },
  { id: 'aws-lambda', sectionId: 'aws', name: 'AWS Lambda' },
  { id: 'aws-emr', sectionId: 'aws', name: 'EMR & Spark on EMR' },
  { id: 'aws-redshift', sectionId: 'aws', name: 'Redshift' },
  { id: 'aws-airflow', sectionId: 'aws', name: 'Airflow' },
  { id: 'aws-git-linux', sectionId: 'aws', name: 'Git & Linux' }
];

export const ADDITIONAL_SECTIONS = [
  { id: 'production', name: 'Production Troubleshooting', icon: 'Wrench', isNav: true, isStudySection: true, color: '#f97316' }
];

const groups = [
  {
    idPrefix: 'scenario-python', sectionId: 'scenario', topicId: 'scenario-python', difficulty: 'Advanced', items: [
      ['You receive a 10 GB CSV file. How will you process it without running out of memory?', 'Read in bounded chunks or stream rows, select only needed columns, validate each batch, and write results incrementally. For distributed workloads, land the file in object storage and process it with Spark or Glue.'],
      ['Your Python ETL script fails halfway through processing 10 million records. How will you restart it without processing everything again?', 'Persist a checkpoint such as the last committed page, file, or watermark. Resume from that point and use an idempotent upsert or partition replacement so a retry cannot duplicate already committed records.'],
      ['An API returns 1,000 records per request. How will you extract 1 million records?', 'Paginate through roughly 1,000 requests using the API cursor or offset, with bounded concurrency and rate-limit handling. Persist each page, checkpoint the cursor, deduplicate by a stable key, and retry failed pages safely.'],
      ['Your source API sometimes returns 500 errors. How will you implement retry logic?', 'Retry transient 5xx errors, throttling, and timeouts with exponential backoff and jitter; honor Retry-After when supplied and cap attempts. Do not retry permanent 4xx validation errors; log and route exhausted requests for review.'],
      ['A CSV file contains invalid dates, missing values, and duplicate records. How will you clean it?', 'Read with an explicit schema, parse dates strictly, apply documented NULL rules, and quarantine invalid rows with rejection reasons. Deduplicate by business key using a deterministic tie-breaker, then reconcile accepted, rejected, and duplicate counts.'],
      ['Your Python script takes 3 hours to process a dataset. How will you improve performance?', 'Profile CPU, memory, and I/O first. Remove row-by-row work where vectorized or batched operations fit, reduce repeated reads and writes, use appropriate indexes or partition pruning, and add parallelism only after measuring the bottleneck.'],
      ['You have 100 CSV files in an S3 bucket. How will you process all files automatically?', 'Use an S3 event or scheduled discovery job to identify new objects, validate their names and schema, and process each object idempotently using its key and version or checksum. Record completion only after the output commits, and route failures to a retry queue or quarantine.'],
      ['How will you handle a situation where the source file schema changes unexpectedly?', 'Validate the file against a versioned schema contract. Accept compatible additive changes only when consumers support them; quarantine or reject breaking type or required-field changes, alert owners, and preserve the raw file for replay.'],
      ['Your ETL job inserts duplicate records after a retry. How will you prevent duplicates?', 'Write with a stable business key using a merge/upsert or replace the affected partition instead of blindly appending. Make the operation idempotent, and commit the processed-file marker only after the target transaction succeeds.'],
      ['How will you implement logging and alerting for a Python ETL pipeline?', 'Emit structured logs with run ID, source, partition, and error context; publish duration, row counts, rejected rows, and freshness metrics. Alert on failed runs or breached thresholds and keep secrets and sensitive payloads out of logs.']
    ]
  },
  {
    idPrefix: 'scenario-sql', sectionId: 'scenario', topicId: 'scenario-sql', difficulty: 'Advanced', items: [
      ['A table contains 100 million records, and a query takes 20 minutes. How will you optimize it?', 'Inspect the actual execution plan and runtime metrics. Reduce scanned rows and columns with selective, sargable filters; verify join cardinality, indexes or partition pruning, statistics, and sort/shuffle work, then benchmark the change.'],
      ['Your target table contains duplicate customer records. How will you identify and remove them?', 'Find duplicate business keys with GROUP BY and HAVING COUNT(*) > 1. Rank each key by a deterministic recency and tie-break column with ROW_NUMBER, review the rows to retain, and delete or rewrite the extras in a transaction.'],
      ['You need to load only new and updated records from the source table. How will you implement incremental loading?', 'Use CDC when available or a reliable updated_at watermark with an overlap window. Upsert by business key, handle deletes explicitly, and advance the checkpoint only after the target write commits.'],
      ['Your source table has 10 million records, but your target has only 9.8 million. How will you identify missing records?', 'Compare source and target from a consistent snapshot using an anti-join on the business key. Then classify missing keys against expected filters, deletes, and rejected records and reconcile counts or checksums.'],
      ['A customer has multiple transactions on the same day. How will you find their latest transaction?', 'Use ROW_NUMBER partitioned by customer and ordered by transaction timestamp descending plus a unique transaction ID as a tie-breaker. Keep row number one; use RANK instead if all tied latest transactions are required.'],
      ['Your JOIN query is producing more records than expected. What could be the reason?', 'A join key may not be unique on one or both sides, creating a many-to-many result; the join condition or grain may also be wrong. Measure key cardinality on each input, inspect unmatched and duplicate keys, and aggregate or deduplicate deliberately.'],
      ['How will you calculate daily, weekly, and monthly revenue?', "Aggregate the revenue measure by a consistently defined date bucket, such as DATE_TRUNC('day', event_time), and use the correct calendar, time zone, and week-start rules. Reconcile each period total to the underlying transactions."],
      ['How would you identify records deleted from the source but still present in the target?', 'Use source CDC tombstones or compare source and target key sets from the same snapshot. Target keys absent from the source are delete candidates; confirm the deletion rule before applying them, then record the action in the audit trail.'],
      ['How do you implement Slowly Changing Dimension Type 1 and Type 2?', 'For Type 1, update the current row in place. For Type 2, expire the current version and insert a new row with effective timestamps and a current flag; use a stable business key and deterministic, idempotent merge logic.'],
      ['A SQL query works correctly but takes too much time in production. What steps will you take?', 'Capture the production plan and wait, CPU, I/O, and lock metrics; compare parameters and data volume with faster runs. Fix the measured cause—such as stale statistics, scans, skew, or poor joins—then benchmark and monitor the result.']
    ]
  },
  {
    idPrefix: 'scenario-pyspark', sectionId: 'scenario', topicId: 'scenario-pyspark', difficulty: 'Advanced', items: [
      ['Your PySpark job processes 100 GB of data and runs very slowly. How will you troubleshoot it?', 'Use the Spark UI to find slow stages, skewed tasks, shuffle volume, spills, garbage collection, and input file sizes. Push filters and projections early, tune partitions or joins based on evidence, and verify the physical plan and output.'],
      ['One executor consumes significantly more memory than the others. What could be the reason?', 'A hot key or uneven partition can send far more data to one executor; oversized partitions, caching, or a memory-heavy task can also cause it. Compare task input, shuffle, spill, and GC metrics, then address the measured skew or retention issue.'],
      ['Your Spark job fails with an OutOfMemoryError. How will you resolve it?', 'Locate whether the driver or executor ran out of memory and inspect the failing stage. Avoid collecting large data to the driver, reduce retained caches, address skew and oversized partitions, and tune executor memory or overhead only when metrics justify it.'],
      ['One partition contains 80% of your data. How will you fix the data skew?', 'Confirm the hot key, then reduce data before the join, broadcast a genuinely small side, or salt the hot key and repartition. Adaptive skew handling may help; validate task balance and output correctness after the change.'],
      ['You are joining a 100 GB DataFrame with a 5 MB DataFrame. Which join strategy will you use?', 'Broadcast the 5 MB side if its expanded in-memory size fits safely on every executor. Confirm Spark chooses a broadcast hash join in the plan; otherwise use a shuffle strategy and tune partitions.'],
      ['Your job has many shuffle operations. How will you reduce shuffling?', 'Filter and select columns before wide operations, combine compatible aggregations, and avoid unnecessary repartitions or repeated sorts. Broadcast small dimensions where safe, preserve useful partitioning, and confirm shuffle reduction in the Spark UI.'],
      ['Your PySpark job runs successfully in development but fails in production. How will you debug it?', 'Compare runtime and Spark versions, configuration, input schema and volume, IAM/network access, dependencies, and secret setup. Inspect production driver and executor logs, reproduce with the same data shape, and isolate the difference before changing code.'],
      ['You need to process multiple large CSV files and write the output as Parquet. How will you design the job?', 'Read files in parallel with an explicit schema, select needed columns, validate and transform distributed data, and write compressed Parquet with partitions matching common reads. Control output partition sizes and make the target write retry-safe.'],
      ['Your Spark job creates thousands of small Parquet files. How will you solve this problem?', 'Reduce the number of output partitions with a suitable repartition or coalesce before writing, and compact existing files by partition. Target practical file sizes without funneling the whole dataset through one task.'],
      ['Your job is taking 2 hours, but the same job previously took 30 minutes. How will you investigate?', 'Compare input volume and file count, code/config changes, query plans, and Spark UI stage metrics with the last good run. Look for skew, shuffle, spill, GC, or infrastructure changes; roll back a confirmed regression and add a runtime alert.'],
      ['How do you handle late-arriving records in a PySpark pipeline?', 'Track event time separately from processing time and define an allowed-lateness window. Update or recompute affected partitions for records within the window, deduplicate by event key, and route later records to a correction path.'],
      ['How do you handle schema changes in incoming JSON files?', 'Prefer a versioned explicit schema and define compatibility rules. Capture unknown fields for review, allow safe additive fields when downstream tables support them, and quarantine incompatible changes rather than silently inferring a different type.'],
      ['How do you implement incremental processing using a watermark column?', 'Read records newer than the last committed watermark, often with a small overlap window, then deduplicate and merge by business key. Persist the new watermark only after the sink commits so a retry cannot skip data.'],
      ['How do you recover a failed Spark job without losing previously processed data?', 'Write to a staging or transactional target and publish only after validation succeeds. Use an idempotent partition replacement or merge, retain committed partitions, and restart from a checkpoint or logical date rather than partially appending again.'],
      ['How would you process data partitioned by year, month, and day?', 'Read only the required year/month/day paths or apply partition filters so the engine prunes other data. Validate the path and event-date mapping, preserve a consistent schema, and compact small output files within each partition.']
    ]
  },
  {
    idPrefix: 'project', sectionId: 'projects', topicId: 'projects-end-to-end', difficulty: 'Advanced', items: [
      ['Explain your complete ETL pipeline from source to target.', 'Describe the source and cadence, raw landing, schema and quality checks, business transformations, deduplication, curated target, orchestration, monitoring, and recovery. Add real volumes, incremental strategy, security choices, and your specific contribution.'],
      ['How do you ingest data from multiple source systems?', 'Use source-specific connectors with a shared raw metadata contract for run ID, extraction time, schema version, and source key. Apply each source’s CDC or pagination strategy, checkpoint independently, and orchestrate idempotent downstream processing.'],
      ['How do you design a scalable ETL pipeline?', 'Separate ingestion from transformation, land replayable raw data, and use distributed processing with partitioned columnar storage. Process incrementally, scale compute with volume, make writes idempotent, and monitor freshness, quality, cost, and recovery.'],
      ['How do you implement full load and incremental load?', 'Run a full snapshot for initialization or controlled rebuilds. Then use CDC or a reliable watermark to capture inserts and updates, merge by business key, process deletes, and advance the checkpoint only after a successful target commit.'],
      ['How do you handle duplicate data across multiple source files?', 'Normalize records and deduplicate by a stable business key using a deterministic source priority or latest update timestamp. Make processing idempotent across file retries and retain duplicate counts for audit rather than silently dropping them.'],
      ['How do you handle schema evolution?', 'Manage schemas as versioned contracts with explicit compatibility rules. Accept tested additive changes where safe, quarantine breaking changes, update the catalog and consumers deliberately, and keep raw data available for replay.'],
      ['How do you implement data quality checks?', 'Check required fields, key uniqueness, valid ranges, referential integrity, freshness, and expected volume. Define thresholds and whether each check blocks, quarantines, or warns; publish results and alert with enough context to act.'],
      ['How do you validate source and target record counts?', 'Compare counts at the same snapshot or watermark and account for filters, rejects, and deletes. Reconcile by partition and business key, then use checksums or aggregates to detect changed values that counts alone miss.'],
      ['How do you handle failed ETL jobs?', 'Classify transient infrastructure errors for bounded retry and route permanent data or contract failures to quarantine. Preserve checkpoints, write idempotently, alert with run context, and publish only complete validated outputs.'],
      ['How do you implement data reconciliation?', 'Compare source and target keys, counts, and critical field aggregates from the same logical slice. Use anti-joins to find missing or extra rows, classify expected transformations, and retain a reconciliation report for each run.'],
      ['How do you handle late-arriving data?', 'Define a lateness window using event time, then update or recompute the affected partitions when late records arrive. Deduplicate and merge corrections, and route records outside the normal window to a controlled backfill or exception process.'],
      ['How do you maintain audit columns?', 'Populate consistent fields such as source system, batch/run ID, ingestion time in UTC, created_at, updated_at, and logical date. Preserve source event time separately and update audit fields only according to documented insert/update rules.'],
      ['How do you implement SCD Type 1 and Type 2?', 'Type 1 overwrites changed attributes in the current record. Type 2 closes the current version and inserts a new effective-dated version with current status; use business keys and an idempotent merge so retries do not create extra versions.'],
      ['How do you manage sensitive data?', 'Classify sensitive fields, restrict access with least-privilege roles, encrypt in transit and at rest, and mask or tokenize values for non-production use. Store secrets in a secret manager, limit retention, and audit access without logging payloads.'],
      ['How do you monitor production pipelines?', 'Track run state, duration, freshness, lag, input/output/rejected counts, data-quality results, and cost. Alert on actionable SLA or quality breaches, link alerts to logs and runbooks, and review trends for recurring failures.'],
      ['How do you implement CI/CD for ETL jobs?', 'Version code and infrastructure, run linting and unit/data-contract tests, build an immutable artifact, and deploy through controlled environments with configuration separated from code. Add approval or canary checks and a tested rollback path.'],
      ['How do you manage different environments such as Dev, QA, and Production?', 'Promote the same versioned artifact through environments while keeping endpoints, permissions, and secrets in environment-specific configuration. Use infrastructure as code, test representative data, and apply production changes with scoped roles and rollback.'],
      ['How do you schedule and orchestrate ETL pipelines?', 'Model dependencies explicitly in a scheduler such as Airflow, with bounded retries, timeouts, concurrency limits, and freshness SLAs. Make each task idempotent, parameterize logical dates, and support controlled backfills.'],
      ['What happens if an upstream pipeline fails?', 'The downstream task should remain blocked until upstream success and required data-quality checks pass. Surface the failed dependency, preserve the run context, alert owners, and allow a safe rerun once upstream data is corrected.'],
      ['How do you design a pipeline that processes 100 million records daily?', 'Use distributed compute, incremental ingestion, partitioned columnar storage, and parallel writes sized to the SLA. Control skew and small files, add quality gates and checkpointed recovery, and benchmark throughput and cost at realistic scale.']
    ]
  },
  {
    idPrefix: 'production', sectionId: 'production', topicId: 'production-incidents', difficulty: 'Advanced', items: [
      ['Your Glue job succeeded, but the expected data is missing in S3. How do you investigate?', 'Check the job run logs and metrics, actual output bucket/prefix, account and region, IAM permissions, filters, bookmarks, partition values, and write mode. Verify S3 objects and catalog locations, then compare expected and actual counts before rerunning.'],
      ['Athena is showing duplicate records after every ETL execution. How do you fix it?', 'Identify duplicate business keys and trace whether each run appends or reprocesses input. Deduplicate deterministically and use partition replacement or an upsert/transactional table so retries cannot append the same logical records.'],
      ['Your Airflow DAG is stuck in the running state. What will you check?', 'Inspect DAG/task state, scheduler and worker heartbeats, executor capacity, queued tasks, pools, concurrency limits, and logs for zombie or blocked processes. Verify whether external work is still running before clearing a task, and confirm its side effects are idempotent.'],
      ['An upstream job failed, but the downstream job started. How do you prevent this?', 'Use explicit task or dataset dependencies and require successful upstream completion plus data-quality gates. Check custom trigger rules for permissive settings such as all_done, and add a readiness check before downstream publication.'],
      ['Your S3 bucket receives files with different naming conventions. How do you identify and process them?', 'Parse keys against documented patterns and route each recognized type to the right schema and handler. Use a manifest or object metadata for traceability, make processing idempotent by object version/checksum, and quarantine unknown names.'],
      ['Your target table has incorrect data after a deployment. How do you recover?', 'Stop unsafe downstream consumption, identify the release, run, and affected partitions, and preserve raw inputs. Roll back code/configuration or rebuild the affected slice in staging, validate it, then publish atomically and record the recovery.'],
      ['Your pipeline processes the same file twice. How do you prevent duplicate processing?', 'Treat object events as at-least-once and track a stable identity such as bucket, key, version ID, or checksum. Make the target write idempotent and mark the file complete only after the output commits.'],
      ['How do you implement idempotency in an ETL pipeline?', 'Use deterministic transformations and stable business keys, then merge or replace the affected partition rather than append. Commit output and processing state together where possible, and make external side effects use idempotency tokens.'],
      ['How do you handle backfills for the previous 30 days?', 'Parameterize the job by logical date and replay the 30 partitions from retained raw data with bounded concurrency. Use idempotent writes, validate each partition, and publish or roll back through a controlled process instead of relying on the current clock.'],
      ['How do you design a pipeline that can recover automatically after failures?', 'Use checkpoints, bounded retries with backoff for transient errors, idempotent writes, and explicit failure classification. Quarantine permanent bad records, alert after retry exhaustion, and require quality checks before publishing recovered output.'],
      ['What happens when a source file arrives late?', 'Keep the affected partition pending for a defined grace period or use event-driven arrival signals. When the file arrives, process it by event date, update the watermark or partition safely, and alert if the freshness SLA is breached.'],
      ['How do you handle partial data loads?', 'Write to staging and verify expected files, schema, counts, and quality before publication. Commit a complete partition or transaction atomically; leave the previous valid output available and mark incomplete runs as failed.'],
      ['How do you ensure that a pipeline never publishes incomplete data?', 'Separate staging from consumer-visible output and gate publication on completeness and quality checks. Use an atomic table/partition swap or transactional commit, and expose only committed snapshots or success manifests to readers.'],
      ['How do you manage changes in business logic without breaking existing pipelines?', 'Version the transformation and data contract, add regression tests and representative comparisons, and plan whether historical data needs a backfill. Roll out through staging or a canary, monitor differences, and keep a rollback path.'],
      ['How would you reduce AWS Glue job execution costs?', 'Measure DPU time and identify I/O, shuffle, or idle capacity first. Push filters and projections into reads, use columnar compression and sensible partitions, right-size workers, avoid small files and skew, and run only the required incremental work.']
    ]
  },
  {
    idPrefix: 'aws-s3', sectionId: 'aws', topicId: 'aws-s3', difficulty: 'Basics', items: [
      ['What are S3 buckets and objects?', 'A bucket is a regional container for objects; an object is the data plus metadata addressed by a key. S3 uses a flat object namespace, so apparent folders are key prefixes rather than filesystem directories.'],
      ['What are S3 storage classes?', 'Storage classes trade access frequency, retrieval latency, availability, and cost. Choose among options such as Standard, Intelligent-Tiering, infrequent-access, and Glacier classes based on the data’s retention and retrieval pattern.'],
      ['What is S3 versioning?', 'Versioning preserves multiple versions of an object key, allowing recovery from overwrite or deletion; a delete typically creates a delete marker. It improves recovery but can increase storage cost, so pair it with lifecycle rules.'],
      ['What are S3 lifecycle policies?', 'Lifecycle rules transition objects between storage classes or expire current and noncurrent versions based on age, prefix, or tags. They can also clean up incomplete multipart uploads and enforce retention policies.'],
      ['How do you organize data in S3 for analytics?', 'Use predictable prefixes by domain, environment, table, and commonly filtered date; store raw data immutably and curated data in compressed columnar formats. Register schemas and partitions, and avoid excessive tiny files or high-cardinality partitioning.']
    ]
  },
  {
    idPrefix: 'aws-iam', sectionId: 'aws', topicId: 'aws-iam', difficulty: 'Basics', items: [
      ['What are IAM users, groups, roles, and policies?', 'Users represent identities with credentials, groups organize users, and roles provide temporary credentials to trusted principals or services. Policies are documents that allow or deny actions on resources under specified conditions.'],
      ['What is an IAM trust relationship?', 'A role trust policy defines which principals may assume the role and under what conditions. It answers who can obtain the role’s temporary credentials; the role’s permission policies separately define what those credentials can do.'],
      ['How do you troubleshoot AccessDenied errors?', 'Confirm the caller identity and exact action/resource, then inspect identity and resource policies, role trust, permissions boundaries, session policies, SCPs, endpoint policies, and KMS permissions. Look for explicit denies and use audit logs to trace the request.']
    ]
  },
  {
    idPrefix: 'aws-glue', sectionId: 'aws', topicId: 'aws-glue', difficulty: 'Intermediate', items: [
      ['What are Glue Crawlers and the Glue Data Catalog?', 'A crawler can inspect supported data sources and infer or update table metadata. The Glue Data Catalog stores schemas, locations, and partition metadata; it describes the data but does not contain the S3 records themselves.'],
      ['What is a Glue Job?', 'A Glue Job is a managed ETL execution that can run Spark or Python-based processing with configured capacity, connections, parameters, and logging. It reads sources, transforms data, and writes to destinations such as S3 or cataloged tables.'],
      ['What is the difference between DynamicFrame and DataFrame?', 'A DynamicFrame is Glue’s ETL abstraction that can represent inconsistent or choice-type schemas and includes Glue transforms. A Spark DataFrame has a defined Spark SQL schema and broad Spark APIs; convert when the schema is resolved or Spark operations are preferable.'],
      ['What are Glue job bookmarks?', 'Bookmarks track progress for supported sources so later runs can skip previously processed input. They are not a transaction for the target; enable and test them with an idempotent sink, and reset or configure them deliberately for backfills.'],
      ['How do you troubleshoot a failed Glue job?', 'Start with the job run’s driver and executor logs, error metrics, and failed stage. Check source paths and schema, IAM and network access, catalog/connection settings, bookmark state, worker capacity, and shuffle or skew before retrying.']
    ]
  },
  {
    idPrefix: 'aws-athena', sectionId: 'aws', topicId: 'aws-athena', difficulty: 'Basics', items: [
      ['What is Amazon Athena?', 'Athena is a managed SQL query service that reads data in S3 without requiring a provisioned cluster. It commonly uses the Glue Data Catalog for table metadata, and query cost depends largely on data scanned.'],
      ['What are external tables?', 'An external table stores schema and location metadata that points to data files outside the query engine, often in S3. The table does not copy or own the underlying records, so file layout and lifecycle must be managed separately.'],
      ['How do you optimize Athena queries?', 'Use compressed Parquet or ORC, select only needed columns, filter on partition keys, and avoid scanning unnecessary files. Compact tiny files, keep catalog metadata current, and inspect scanned bytes and query plans.'],
      ['How do you partition data for Athena?', 'Partition by columns frequently used in selective filters, commonly a date such as year/month/day. Balance pruning benefits against partition and file-count overhead, and keep S3 paths, catalog metadata, and query predicates aligned.']
    ]
  },
  {
    idPrefix: 'aws-lambda', sectionId: 'aws', topicId: 'aws-lambda', difficulty: 'Intermediate', items: [
      ['What are AWS Lambda triggers and event processing?', 'Triggers such as S3 notifications, EventBridge, or queue mappings invoke a Lambda function when work is available. Validate the event, process a bounded unit, and design for duplicate delivery, source-specific retries, and explicit failure routing.'],
      ['How do retries work in Lambda?', 'Retry behavior depends on whether invocation is synchronous, asynchronous, or through an event source mapping. Configure the source’s retry, visibility, and failure destination settings, make handlers idempotent, and monitor exhausted events rather than assuming one universal retry policy.']
    ]
  },
  {
    idPrefix: 'aws-emr', sectionId: 'aws', topicId: 'aws-emr', difficulty: 'Intermediate', items: [
      ['What is Amazon EMR?', 'Amazon EMR is a managed platform for running distributed data frameworks such as Spark and Hadoop. It offers different deployment choices for cluster-based or serverless processing, with S3 commonly used for durable input and output.'],
      ['Explain EMR cluster architecture.', 'In a classic EMR on EC2 cluster, the primary node coordinates the cluster, core nodes run compute and can store HDFS data, and task nodes add compute without HDFS storage. Managed serverless and other deployment modes have different infrastructure details.'],
      ['How does Spark run on EMR?', 'Submit a Spark application to an EMR runtime; a driver builds and coordinates the work while executors process partitions in parallel. The job can read and write S3, and its logs, resource settings, and Spark UI help diagnose performance and failure.']
    ]
  },
  {
    idPrefix: 'aws-redshift', sectionId: 'aws', topicId: 'aws-redshift', difficulty: 'Intermediate', items: [
      ['What are Redshift distribution styles?', 'Distribution determines how table rows are placed across compute nodes. KEY can colocate matching joins, EVEN spreads rows broadly, ALL replicates a small table, and AUTO lets Redshift manage the choice; validate using actual workload patterns.'],
      ['What are sort keys?', 'Sort keys define the order in which Redshift stores table data and can help skip blocks for common filters or improve joins. Choose them from query patterns and data characteristics, then verify scan and maintenance behavior.'],
      ['How do you load data into Redshift using COPY?', 'Place consistent input files in S3 and run COPY with an IAM role, file format, and options that match the data. Load into staging when practical, inspect load errors, validate counts, and merge or swap into the target.'],
      ['What is UNLOAD in Redshift?', 'UNLOAD writes the result of a Redshift query to files in S3, commonly in parallel and with optional compression or partitioning. Use an authorized IAM role, choose a downstream-friendly format, and manage the output prefix deliberately.']
    ]
  },
  {
    idPrefix: 'aws-airflow', sectionId: 'aws', topicId: 'aws-airflow', difficulty: 'Basics', items: [
      ['What is an Airflow DAG?', 'A DAG is an acyclic graph that defines workflow tasks, their dependencies, and scheduling behavior. The scheduler creates runs and schedules eligible tasks; operators or task code perform the actual work.'],
      ['What are operators and tasks?', 'An operator is a reusable definition of an action, such as running Python or a SQL statement. A task is a configured operator instance in a DAG with a task ID, parameters, and dependencies.'],
      ['How do task dependencies work?', 'Dependencies specify the order in which tasks become eligible to run, commonly with upstream/downstream relationships such as task_a >> task_b. Trigger rules determine how upstream states affect execution; use XCom for small control metadata, not large datasets.'],
      ['How do retries and scheduling work?', 'A DAG’s schedule creates runs for logical data intervals, while task settings define retry count, delay, timeout, and trigger behavior. Configure catchup intentionally and use the logical date for repeatable backfills instead of the machine clock.'],
      ['How do you troubleshoot a failed DAG?', 'Inspect the failed task’s logs and state, upstream dependencies, scheduler and worker health, pools, connections, permissions, and external service errors. Retry only after understanding whether prior side effects committed, and fix the task to be idempotent.']
    ]
  },
  {
    idPrefix: 'aws-git-linux', sectionId: 'aws', topicId: 'aws-git-linux', difficulty: 'Basics', items: [
      ['Explain Git branching and merging.', 'A branch isolates a line of work from the shared base. After committing and reviewing changes, merge the branch into the target branch using the team’s merge policy, resolve conflicts, and rerun checks.'],
      ['How do you resolve merge conflicts?', 'Inspect each conflicted file and understand both changes, edit the file to the intended combined result, and remove conflict markers. Run relevant tests, stage the resolved files, and complete the merge; do not accept one side blindly.'],
      ['What is a pull request?', 'A pull request proposes a reviewed change from one branch into another. It provides a place for discussion and automated checks before the change is approved and merged.'],
      ['What Linux commands do you use to inspect files and directories?', 'Use ls and find to locate paths, du and df for disk usage, head/tail and less to inspect content, grep or rg to search, and stat or file for metadata and type. Use tail -f for live logs and avoid dumping secrets.'],
      ['How do you manage file permissions in Linux?', 'Use chmod to adjust permission bits, chown to change ownership, and umask to control default permissions. Grant the minimum access needed and verify both user/group ownership and directory traversal permissions.'],
      ['How do you use shell scripts in data pipelines?', 'Use scripts for repeatable setup, validation, or orchestration helpers with explicit arguments, safe quoting, clear exit codes, structured logs, and traps for cleanup. Keep secrets out of command lines and logs, and make reruns safe.']
    ]
  }
];

export const ADDITIONAL_QUESTIONS = groups.flatMap((group) => {
  return group.items.map(([question, shortAnswer], index) => ({
    id: `${group.idPrefix}-${String(index + 1).padStart(2, '0')}`,
    sectionId: group.sectionId,
    topicId: group.topicId,
    difficulty: group.difficulty,
    question,
    answerFormat: 'text',
    shortAnswer,
    explanation: '',
    takeaways: [],
    infographicData: null,
    active: true,
    createdAt: '2026-11-11T00:00:00Z',
    updatedAt: '2026-11-11T00:00:00Z'
  }));
});
