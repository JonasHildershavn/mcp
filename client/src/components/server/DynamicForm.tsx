import { useState, useEffect } from 'react';

interface DynamicFormProps {
  schema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  onChange: (values: Record<string, any>) => void;
}

export function DynamicForm({ schema, onChange }: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    onChange(values);
  }, [values, onChange]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const properties = schema.properties || {};
  const required = schema.required || [];

  return (
    <div className="space-y-3">
      {Object.entries(properties).map(([name, prop]) => (
        <FormField
          key={name}
          name={name}
          property={prop}
          required={required.includes(name)}
          value={values[name]}
          onChange={(value) => handleChange(name, value)}
        />
      ))}
    </div>
  );
}

interface FormFieldProps {
  name: string;
  property: any;
  required: boolean;
  value: any;
  onChange: (value: any) => void;
}

function FormField({ name, property, required, value, onChange }: FormFieldProps) {
  const type = property.type || 'string';
  const description = property.description || '';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {name}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-1">{description}</p>
      )}

      {type === 'number' && (
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={`Enter ${name}`}
        />
      )}

      {type === 'string' && (
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={`Enter ${name}`}
        />
      )}

      {type === 'boolean' && (
        <input
          type="checkbox"
          checked={value ?? false}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      )}

      {type === 'array' && (
        <input
          type="text"
          value={value ? (Array.isArray(value) ? value.join(', ') : value) : ''}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val ? val.split(',').map(s => s.trim()) : undefined);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Comma-separated values"
        />
      )}
    </div>
  );
}
