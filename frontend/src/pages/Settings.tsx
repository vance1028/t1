import { Shield, Zap, Thermometer, Wind, Droplets, AlertTriangle } from 'lucide-react';
import ThresholdTable from '@/components/ThresholdTable';

const INTERLOCK_RULES = [
  {
    icon: Thermometer,
    title: '温度超限联锁',
    description: '当舱室温度超过二级阈值时，自动启动通风系统；当温度恢复正常时，延时5分钟后关闭通风。',
    trigger: '温度 > 二级阈值',
    action: '启动通风系统',
  },
  {
    icon: Wind,
    title: '有害气体联锁',
    description: '当有害气体浓度超过二级阈值时，立即启动通风并禁止人员进入；浓度恢复到一级阈值以下后，解除禁入。',
    trigger: '气体浓度 > 二级阈值',
    action: '启动通风 + 禁止进入',
  },
  {
    icon: Droplets,
    title: '水位超标联锁',
    description: '当积水水位超过二级阈值时，自动启动排水泵；水位低于一级阈值后，延时3分钟关闭水泵。',
    trigger: '水位 > 二级阈值',
    action: '启动排水泵',
  },
  {
    icon: AlertTriangle,
    title: '氧气不足联锁',
    description: '当氧气浓度低于二级阈值时，立即禁止人员进入并启动通风；氧气恢复到19.5%以上后解除禁入。',
    trigger: '氧气 < 二级阈值',
    action: '启动通风 + 禁止进入',
  },
  {
    icon: Shield,
    title: '防火门状态联锁',
    description: '当防火门状态异常（未关闭）时触发告警；与动火作业联动，动火前需确认防火门状态。',
    trigger: '防火门未关闭',
    action: '触发告警',
  },
];

export default function Settings() {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-200 mb-4">阈值与联锁配置</h2>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          阈值设置
        </h3>
        <ThresholdTable />
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          联锁规则说明
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {INTERLOCK_RULES.map((rule) => (
            <div
              key={rule.title}
              className="bg-tunnel-panel border border-tunnel-border rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <rule.icon className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-medium text-gray-200">{rule.title}</h4>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">{rule.description}</p>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-alarm-2/10 text-alarm-2 font-mono">
                  {rule.trigger}
                </span>
                <span className="text-gray-600">→</span>
                <span className="px-2 py-0.5 rounded bg-accent/10 text-accent font-mono">
                  {rule.action}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
