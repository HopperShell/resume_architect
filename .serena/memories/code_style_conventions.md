# Code Style and Conventions

## TypeScript/React (Frontend)

### General Style
- Use functional components with hooks
- TypeScript with strict mode enabled
- Named exports for components
- Default export for main App component

### Naming Conventions
- **Components**: PascalCase (e.g., `ResumeBuilder.tsx`)
- **Functions**: camelCase (e.g., `handleResumeGenerated`)
- **Variables**: camelCase
- **Types/Interfaces**: PascalCase
- **Files**: PascalCase for components, camelCase for utilities

### Component Structure
```tsx
import React, { useState } from 'react';

interface ComponentProps {
  propName: string;
  onAction: () => void;
}

function ComponentName({ propName, onAction }: ComponentProps) {
  const [state, setState] = useState('');
  
  return (
    <div>...</div>
  );
}

export default ComponentName;
```

### Styling
- Use Tailwind CSS utility classes
- Inline className strings

## Python (Backend)

### General Style
- Follow PEP 8 guidelines
- Use type hints for function parameters and returns
- Docstrings for modules and complex functions

### Naming Conventions
- **Classes**: PascalCase (e.g., `ResumeProcessor`)
- **Functions/Methods**: snake_case (e.g., `process_resume`)
- **Variables**: snake_case
- **Constants**: UPPER_SNAKE_CASE
- **Files**: snake_case (e.g., `resume_processor.py`)

### FastAPI Patterns
- Use Pydantic models for request/response validation
- Use `Field` for model field configuration
- Type hints with `Optional` and `List` from typing

### Example Pydantic Model
```python
from pydantic import BaseModel, Field
from typing import Optional, List

class ResumeCustomization(BaseModel):
    selected_skills: List[str] = Field(default_factory=list)
    title: Optional[str] = None
```

## Import Organization
- Standard library imports first
- Third-party imports second
- Local imports third
- Blank line between each group
