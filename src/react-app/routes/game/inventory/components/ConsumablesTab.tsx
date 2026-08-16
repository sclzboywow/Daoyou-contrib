import {
  ConsumableListCard,
  getTalismanActionHref,
  getTalismanActionLabel,
  isAttributeResetTalisman,
  isQiRestoreTalisman,
} from '@app/components/feature/consumables';
import { GameLoadingState } from '@app/components/game-shell/GameLoadingState';
import { InkButton, InkList, InkNotice } from '@app/components/ui';
import {
  isPillConsumable,
  isSpiritFruitSpec,
  isTalismanConsumable,
} from '@shared/lib/consumables';
import { getResourceTypeLabel } from '@shared/lib/gameConceptDisplay';
import type { CultivatorCondition } from '@shared/types/condition';
import type { RealmType } from '@shared/types/constants';
import type { Consumable } from '@shared/types/cultivator';
import type { ConsumableKindFilter } from '../hooks/useInventoryViewModel';

interface ConsumablesTabProps {
  consumables: Consumable[];
  realm?: RealmType;
  condition?: CultivatorCondition;
  isLoading?: boolean;
  pendingId: string | null;
  onShowDetails: (item: Consumable) => void;
  onConsume: (item: Consumable) => void;
  onDiscard: (item: Consumable) => void;
  kindFilter: ConsumableKindFilter;
  onKindFilterChange: (kind: ConsumableKindFilter) => void;
}

/**
 * 消耗品 Tab 组件
 */
export function ConsumablesTab({
  consumables,
  realm,
  condition,
  isLoading = false,
  pendingId,
  onShowDetails,
  onConsume,
  onDiscard,
  kindFilter,
  onKindFilterChange,
}: ConsumablesTabProps) {
  if (isLoading) {
    return (
      <GameLoadingState
        message={`正在检索${getResourceTypeLabel('consumable')}记录，请稍候……`}
        variant="inline"
      />
    );
  }

  // 按类型排序：符箓在前，灵果与丹药随后
  const sortedItems = [...consumables].sort((a, b) => {
    if (a.type === '符箓' && b.type !== '符箓') return -1;
    if (a.type !== '符箓' && b.type === '符箓') return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" aria-label="消耗品筛选">
        {(
          [
            ['all', '全部'],
            ['pill', '丹药'],
            ['spirit_fruit', '灵果'],
            ['talisman', '符箓'],
          ] as const
        ).map(([value, label]) => (
          <InkButton
            key={value}
            variant={kindFilter === value ? 'primary' : 'secondary'}
            onClick={() => onKindFilterChange(value)}
          >
            {label}
          </InkButton>
        ))}
      </div>
      {!consumables || consumables.length === 0 ? (
        <InkNotice>
          当前分类暂无{getResourceTypeLabel('consumable')}。
        </InkNotice>
      ) : (
        <InkList>
          {sortedItems.map((item, idx) => {
            const isTalisman = isTalismanConsumable(item);
            const isDirectlyUsable =
              isPillConsumable(item) ||
              isSpiritFruitSpec(item.spec) ||
              isQiRestoreTalisman(item) ||
              isAttributeResetTalisman(item);
            const scenarioHref = getTalismanActionHref(item);
            const scenarioActionLabel = getTalismanActionLabel(item);
            const canNavigateToScenario = Boolean(item.id && scenarioHref);

            return (
              <ConsumableListCard
                key={item.id || idx}
                consumable={item}
                realm={realm}
                condition={condition}
                showUsageHint={false}
                actions={
                  <div className="flex gap-2">
                    <InkButton
                      variant="secondary"
                      onClick={() => onShowDetails(item)}
                    >
                      详情
                    </InkButton>
                    <InkButton
                      disabled={
                        !item.id ||
                        (!isDirectlyUsable && !canNavigateToScenario)
                      }
                      pending={pendingId === item.id}
                      pendingLabel="使用中……"
                      onClick={
                        canNavigateToScenario
                          ? undefined
                          : () => onConsume(item)
                      }
                      href={canNavigateToScenario ? scenarioHref : undefined}
                      variant="primary"
                    >
                      {canNavigateToScenario
                        ? scenarioActionLabel
                        : isTalisman
                          ? isDirectlyUsable
                            ? '使用'
                            : '需前往玩法'
                          : isDirectlyUsable
                            ? '服用'
                            : '暂未开放'}
                    </InkButton>
                    <InkButton
                      variant="primary"
                      onClick={() => onDiscard(item)}
                    >
                      销毁
                    </InkButton>
                  </div>
                }
              />
            );
          })}
        </InkList>
      )}
    </div>
  );
}
