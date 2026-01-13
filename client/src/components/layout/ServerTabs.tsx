import { ServerType } from '../../types/mcp';

interface ServerTabsProps {
  activeServer: ServerType;
  onServerChange: (server: ServerType) => void;
}

const serverConfig = {
  calculator: {
    name: 'Calculator',
    color: 'calculator',
    capabilities: 'Tools'
  },
  notes: {
    name: 'Notes',
    color: 'notes',
    capabilities: 'Tools + Resources'
  },
  templates: {
    name: 'Templates',
    color: 'templates',
    capabilities: 'Prompts'
  },
  weather: {
    name: 'Weather',
    color: 'weather',
    capabilities: 'All Three'
  }
};

export function ServerTabs({ activeServer, onServerChange }: ServerTabsProps) {
  const servers: ServerType[] = ['calculator', 'notes', 'templates', 'weather'];

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex space-x-1 px-6">
        {servers.map((server) => {
          const config = serverConfig[server];
          const isActive = activeServer === server;

          return (
            <button
              key={server}
              onClick={() => onServerChange(server)}
              className={`
                relative px-6 py-4 font-medium transition-all
                ${isActive
                  ? `text-${config.color} border-b-2`
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
              style={{
                borderBottomColor: isActive ? `var(--tw-${config.color})` : 'transparent'
              }}
            >
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold">{config.name}</span>
                <span className="text-xs text-gray-500">{config.capabilities}</span>
              </div>
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: `var(--color-${config.color})` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
