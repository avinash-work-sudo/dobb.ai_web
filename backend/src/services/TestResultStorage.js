import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

export class TestResultStorage {
  static async createExecution(executionData) {
    const db = getDatabase();
    const id = executionData.id || uuidv4();

    await db.runAsync(`
      INSERT INTO test_executions (
        id, test_name, task_description, framework, status, 
        started_at, user_id, browser_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      executionData.testName,
      executionData.taskDescription,
      executionData.framework,
      executionData.status,
      executionData.startedAt?.toISOString(),
      executionData.userId,
      executionData.browserInfo
    ]);

    return id;
  }

  static async updateExecution(executionId, updates) {
    const db = getDatabase();
    
    const setClause = [];
    const values = [];

    if (updates.status !== undefined) {
      setClause.push('status = ?');
      values.push(updates.status);
    }
    if (updates.completedAt !== undefined) {
      setClause.push('completed_at = ?');
      values.push(updates.completedAt.toISOString());
    }
    if (updates.durationMs !== undefined) {
      setClause.push('duration_ms = ?');
      values.push(updates.durationMs);
    }
    if (updates.errorMessage !== undefined) {
      setClause.push('error_message = ?');
      values.push(updates.errorMessage);
    }

    if (setClause.length === 0) return;

    values.push(executionId);

    await db.runAsync(`
      UPDATE test_executions 
      SET ${setClause.join(', ')}
      WHERE id = ?
    `, values);
  }

  static async getExecution(executionId) {
    const db = getDatabase();
    
    return await db.getAsync(`
      SELECT * FROM test_executions WHERE id = ?
    `, [executionId]);
  }

  static async getExecutions(filters = {}) {
    const db = getDatabase();
    
    let query = 'SELECT * FROM test_executions WHERE 1=1';
    const values = [];

    if (filters.status) {
      query += ' AND status = ?';
      values.push(filters.status);
    }
    if (filters.framework) {
      query += ' AND framework = ?';
      values.push(filters.framework);
    }
    if (filters.userId) {
      query += ' AND user_id = ?';
      values.push(filters.userId);
    }
    if (filters.startDate) {
      query += ' AND created_at >= ?';
      values.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND created_at <= ?';
      values.push(filters.endDate);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      values.push(filters.limit);
    }

    return await db.allAsync(query, values);
  }

  static async addStep(executionId, stepData) {
    const db = getDatabase();
    const id = uuidv4();

    await db.runAsync(`
      INSERT INTO test_steps (
        id, execution_id, step_number, action_type, instruction,
        target_url, duration_ms, success, error_message, screenshot_path, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      executionId,
      stepData.stepNumber,
      stepData.actionType,
      stepData.instruction,
      stepData.targetUrl,
      stepData.durationMs,
      stepData.success ? 1 : 0,
      stepData.errorMessage,
      stepData.screenshotPath,
      JSON.stringify(stepData.metadata || {})
    ]);

    return id;
  }

  static async getExecutionSteps(executionId) {
    const db = getDatabase();
    
    const steps = await db.allAsync(`
      SELECT * FROM test_steps 
      WHERE execution_id = ? 
      ORDER BY step_number ASC
    `, [executionId]);

    return steps.map(step => ({
      ...step,
      success: Boolean(step.success),
      metadata: step.metadata ? JSON.parse(step.metadata) : {}
    }));
  }

  static async addArtifact(executionId, artifactData) {
    const db = getDatabase();
    const id = uuidv4();

    await db.runAsync(`
      INSERT INTO test_artifacts (
        id, execution_id, artifact_type, file_path, file_size, mime_type, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      executionId,
      artifactData.artifactType,
      artifactData.filePath,
      artifactData.fileSize,
      artifactData.mimeType,
      artifactData.description
    ]);

    return id;
  }

  static async getExecutionArtifacts(executionId) {
    const db = getDatabase();
    
    return await db.allAsync(`
      SELECT * FROM test_artifacts 
      WHERE execution_id = ? 
      ORDER BY created_at ASC
    `, [executionId]);
  }

  static async addRequirement(executionId, requirementData) {
    const db = getDatabase();
    const id = uuidv4();

    await db.runAsync(`
      INSERT INTO test_requirements (
        id, execution_id, requirement_id, requirement_name, coverage_status
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      id,
      executionId,
      requirementData.requirementId,
      requirementData.requirementName,
      requirementData.coverageStatus || 'covered'
    ]);

    return id;
  }

  static async getExecutionRequirements(executionId) {
    const db = getDatabase();
    
    return await db.allAsync(`
      SELECT * FROM test_requirements 
      WHERE execution_id = ? 
      ORDER BY created_at ASC
    `, [executionId]);
  }

  static async getTestStatistics(filters = {}) {
    const db = getDatabase();
    
    let whereClause = 'WHERE 1=1';
    const values = [];

    if (filters.startDate) {
      whereClause += ' AND created_at >= ?';
      values.push(filters.startDate);
    }
    if (filters.endDate) {
      whereClause += ' AND created_at <= ?';
      values.push(filters.endDate);
    }
    if (filters.framework) {
      whereClause += ' AND framework = ?';
      values.push(filters.framework);
    }

    const stats = await db.getAsync(`
      SELECT 
        COUNT(*) as total_executions,
        SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed_executions,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_executions,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_executions,
        AVG(duration_ms) as avg_duration_ms,
        MIN(duration_ms) as min_duration_ms,
        MAX(duration_ms) as max_duration_ms
      FROM test_executions 
      ${whereClause}
    `, values);

    const frameworkStats = await db.allAsync(`
      SELECT 
        framework,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed,
        AVG(duration_ms) as avg_duration
      FROM test_executions 
      ${whereClause}
      GROUP BY framework
    `, values);

    return {
      overall: stats,
      byFramework: frameworkStats
    };
  }

  static async deleteExecution(executionId) {
    const db = getDatabase();
    
    // Foreign key constraints will handle cascading deletes
    await db.runAsync('DELETE FROM test_executions WHERE id = ?', [executionId]);
  }
}
