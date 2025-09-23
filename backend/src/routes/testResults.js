import express from 'express';
import { TestResultStorage } from '../services/TestResultStorage.js';

const router = express.Router();

// GET /api/test-results
router.get('/', async (req, res) => {
  try {
    const {
      status,
      framework,
      userId,
      startDate,
      endDate,
      limit = 50
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (framework) filters.framework = framework;
    if (userId) filters.userId = userId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (limit) filters.limit = parseInt(limit);

    const executions = await TestResultStorage.getExecutions(filters);

    res.json({
      success: true,
      executions,
      count: executions.length,
      filters
    });

  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// GET /api/test-results/:executionId
router.get('/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    
    const execution = await TestResultStorage.getExecution(executionId);
    if (!execution) {
      return res.status(404).json({
        error: 'Test execution not found',
        executionId
      });
    }

    const steps = await TestResultStorage.getExecutionSteps(executionId);
    const artifacts = await TestResultStorage.getExecutionArtifacts(executionId);
    const requirements = await TestResultStorage.getExecutionRequirements(executionId);

    res.json({
      success: true,
      execution,
      steps,
      artifacts,
      requirements,
      isComplete: ['passed', 'failed', 'error'].includes(execution.status)
    });

  } catch (error) {
    console.error('Error fetching test result:', error);
    res.status(500).json({
      error: error.message,
      executionId: req.params.executionId
    });
  }
});

// GET /api/test-results/:executionId/steps
router.get('/:executionId/steps', async (req, res) => {
  try {
    const { executionId } = req.params;
    
    const steps = await TestResultStorage.getExecutionSteps(executionId);
    
    res.json({
      success: true,
      steps,
      executionId
    });

  } catch (error) {
    console.error('Error fetching test steps:', error);
    res.status(500).json({
      error: error.message,
      executionId: req.params.executionId
    });
  }
});

// GET /api/test-results/:executionId/artifacts
router.get('/:executionId/artifacts', async (req, res) => {
  try {
    const { executionId } = req.params;
    
    const artifacts = await TestResultStorage.getExecutionArtifacts(executionId);
    
    res.json({
      success: true,
      artifacts,
      executionId
    });

  } catch (error) {
    console.error('Error fetching test artifacts:', error);
    res.status(500).json({
      error: error.message,
      executionId: req.params.executionId
    });
  }
});

// GET /api/test-results/statistics
router.get('/statistics', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      framework
    } = req.query;

    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (framework) filters.framework = framework;

    const statistics = await TestResultStorage.getTestStatistics(filters);

    res.json({
      success: true,
      statistics,
      filters
    });

  } catch (error) {
    console.error('Error fetching test statistics:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// DELETE /api/test-results/:executionId
router.delete('/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    
    const execution = await TestResultStorage.getExecution(executionId);
    if (!execution) {
      return res.status(404).json({
        error: 'Test execution not found',
        executionId
      });
    }

    await TestResultStorage.deleteExecution(executionId);

    res.json({
      success: true,
      message: 'Test execution deleted successfully',
      executionId
    });

  } catch (error) {
    console.error('Error deleting test result:', error);
    res.status(500).json({
      error: error.message,
      executionId: req.params.executionId
    });
  }
});

export default router;
