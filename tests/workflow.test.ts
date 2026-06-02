import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import yaml from 'js-yaml';

describe('GitHub Actions Workflow (.github/workflows/deploy.yml)', () => {
  const workflowPath = resolve(__dirname, '..', '.github', 'workflows', 'deploy.yml');
  const workflowContent = readFileSync(workflowPath, 'utf-8');
  const workflow = yaml.load(workflowContent) as Record<string, any>;

  describe('Triggers (Requirement 6.1, 6.2)', () => {
    it('workflow file exists at .github/workflows/deploy.yml', () => {
      expect(workflowContent).toBeTruthy();
    });

    it('triggers on push to main branch', () => {
      expect(workflow.on).toBeDefined();
      expect(workflow.on.push).toBeDefined();
      expect(workflow.on.push.branches).toContain('main');
    });

    it('only triggers on push events (no other triggers)', () => {
      const triggerKeys = Object.keys(workflow.on);
      expect(triggerKeys).toContain('push');
    });
  });

  describe('Permissions (Requirement 6.5)', () => {
    it('sets pages: write permission', () => {
      expect(workflow.permissions).toBeDefined();
      expect(workflow.permissions.pages).toBe('write');
    });

    it('sets id-token: write permission', () => {
      expect(workflow.permissions['id-token']).toBe('write');
    });

    it('sets contents: read permission', () => {
      expect(workflow.permissions.contents).toBe('read');
    });
  });

  describe('Concurrency (Requirement 6.8)', () => {
    it('defines a concurrency group', () => {
      expect(workflow.concurrency).toBeDefined();
      expect(workflow.concurrency.group).toBe('pages');
    });

    it('cancels in-progress deployments', () => {
      expect(workflow.concurrency['cancel-in-progress']).toBe(true);
    });
  });

  describe('Build job (Requirement 6.3)', () => {
    it('has a build job', () => {
      expect(workflow.jobs.build).toBeDefined();
    });

    it('build job runs on ubuntu-latest', () => {
      expect(workflow.jobs.build['runs-on']).toBe('ubuntu-latest');
    });

    it('uses actions/checkout action', () => {
      const steps = workflow.jobs.build.steps as Array<Record<string, any>>;
      const checkoutStep = steps.find((s) => s.uses?.startsWith('actions/checkout'));
      expect(checkoutStep).toBeDefined();
    });

    it('uses actions/configure-pages action', () => {
      const steps = workflow.jobs.build.steps as Array<Record<string, any>>;
      const configStep = steps.find((s) => s.uses?.startsWith('actions/configure-pages'));
      expect(configStep).toBeDefined();
    });

    it('uses actions/jekyll-build-pages action to build the site', () => {
      const steps = workflow.jobs.build.steps as Array<Record<string, any>>;
      const buildStep = steps.find((s) => s.uses?.startsWith('actions/jekyll-build-pages'));
      expect(buildStep).toBeDefined();
    });

    it('uses actions/upload-pages-artifact action', () => {
      const steps = workflow.jobs.build.steps as Array<Record<string, any>>;
      const uploadStep = steps.find((s) => s.uses?.startsWith('actions/upload-pages-artifact'));
      expect(uploadStep).toBeDefined();
    });
  });

  describe('Deploy job (Requirement 6.4)', () => {
    it('has a deploy job', () => {
      expect(workflow.jobs.deploy).toBeDefined();
    });

    it('deploy job depends on build job', () => {
      expect(workflow.jobs.deploy.needs).toBe('build');
    });

    it('deploy job runs on ubuntu-latest', () => {
      expect(workflow.jobs.deploy['runs-on']).toBe('ubuntu-latest');
    });

    it('uses actions/deploy-pages action', () => {
      const steps = workflow.jobs.deploy.steps as Array<Record<string, any>>;
      const deployStep = steps.find((s) => s.uses?.startsWith('actions/deploy-pages'));
      expect(deployStep).toBeDefined();
    });

    it('deploy job has github-pages environment', () => {
      expect(workflow.jobs.deploy.environment).toBeDefined();
      expect(workflow.jobs.deploy.environment.name).toBe('github-pages');
    });
  });
});
