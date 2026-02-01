# Task Completion Checklist

When completing a task in Resume Architect, follow these steps:

## Before Committing

### Frontend Changes
1. Ensure TypeScript compiles without errors
2. Run `npm test` if tests exist for modified components
3. Verify the development server starts: `npm start`
4. Check for ESLint warnings/errors in terminal output

### Backend Changes
1. Ensure Python syntax is correct
2. Verify imports are working
3. Test API endpoints manually or via `/docs`
4. Check for any runtime errors

### Docker Changes
1. Rebuild affected containers: `docker-compose build`
2. Test full stack: `docker-compose up`
3. Verify all services start correctly

## Code Quality
- No console.log statements left in production code (frontend)
- No debug print statements left in production code (backend)
- Type annotations present for new functions
- Comments for complex logic

## Testing Locally
1. Start all services: `docker-compose up --build`
2. Navigate to http://localhost:80
3. Test affected functionality manually
4. Check browser console for errors
5. Check backend logs: `docker-compose logs backend`

## Git Workflow
1. Check git status: `git status`
2. Review changes: `git diff`
3. Stage changes: `git add <specific-files>`
4. Commit with descriptive message
5. Push to feature branch

## Note
- This project does not currently have automated linting or formatting scripts configured
- Frontend uses ESLint via react-scripts (integrated into build process)
- No pytest or backend testing framework is currently set up
