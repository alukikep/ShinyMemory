import { useEffect } from 'react';
import { parentArea } from '../../core/areas';
import { CONTENT_INDEX } from '../../core/contentIndex';
import { SPEAKER_NAMES } from '../../core/labels';
import { getDialogueNode, getDialogueText } from '../../core/sim';
import type { GameState } from '../../core/types';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { GameIcon } from './GameIcon';

type DialogueOverlayProps = {
  state: GameState;
  onAdvance: () => void;
  onChoice: (index: number) => void;
};

/** 「一带 · 地点」；独立地点只显示自己。 */
function sceneLocationLabel(locationId: string): string {
  const location = CONTENT_INDEX.locations.get(locationId);
  if (!location) return '';
  const area = parentArea(locationId);
  return area ? `${area.name} · ${location.name}` : location.name;
}

export function DialogueOverlay({
  state,
  onAdvance,
  onChoice,
}: DialogueOverlayProps) {
  const dialogRef = useDialogFocus<HTMLElement>();
  const node = getDialogueNode(state);
  const dialogue = state.pendingDialogueId
    ? CONTENT_INDEX.dialogues.get(state.pendingDialogueId)
    : undefined;
  const speakerId = node?.speakerId;
  const idol = speakerId ? CONTENT_INDEX.idols.get(speakerId) : undefined;
  const actor = speakerId ? CONTENT_INDEX.actors.get(speakerId) : undefined;
  const speakerName = idol?.name ?? actor?.name ?? SPEAKER_NAMES[speakerId ?? ''] ?? '';
  const speakerAvatar = idol?.avatar;
  const choices = node?.choices ?? [];
  const text = node ? getDialogueText(state, node) : '';
  const chapterTitle = state.dialogueChainId
    ? CONTENT_INDEX.storyChains.get(state.dialogueChainId)?.title
    : undefined;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        return;
      }
      if ((event.key === 'Enter' || event.key === ' ') && choices.length === 0) {
        event.preventDefault();
        onAdvance();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [choices.length, onAdvance]);

  if (!dialogue || !node) return null;

  return (
    <div className="dialogue-backdrop" role="presentation">
      <section
        className="dialogue-panel"
        role="dialog"
        aria-modal="true"
        aria-label={speakerName ? `${speakerName}的对话` : '剧情对话'}
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className="dialogue-scene-head">
          <span className="dialogue-scene-title">
            <span className="dialogue-scene-label">STORY</span>
            {chapterTitle ? (
              <span className="dialogue-scene-chapter">{chapterTitle}</span>
            ) : null}
          </span>
          <span className="dialogue-scene-location">
            <GameIcon name="map" size={11} />
            {sceneLocationLabel(state.locationId)}
          </span>
        </div>

        <div className="dialogue-speaker">
          <div className="dialogue-avatar">
            {speakerAvatar ? (
              <img src={speakerAvatar} alt={`${speakerName}Q版头像`} />
            ) : (
              <span>{speakerName.slice(0, 1) || '·'}</span>
            )}
          </div>
          <div>
            <p className="dialogue-speaker-name">
              {speakerName || '旁白'}
            </p>
            <p className="dialogue-speaker-role">
              {idol ? idol.unit : actor ? '事务所' : ''}
            </p>
          </div>
        </div>

        <div className="dialogue-body">
          {text.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {choices.length > 0 ? (
          <div className="dialogue-choices">
            {choices.map((choice, index) => (
              <button
                key={`${choice.label}-${index}`}
                type="button"
                className="dialogue-choice"
                onClick={() => onChoice(index)}
              >
                <span>{choice.label}</span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            className="dialogue-continue"
            onClick={onAdvance}
          >
            <GameIcon name="chevron" size={14} />
            <span>继续</span>
          </button>
        )}
      </section>
    </div>
  );
}
