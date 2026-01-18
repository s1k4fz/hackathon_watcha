import React, { useState } from 'react';
import { generateUserCharacter } from '../services/ai';
import type { Character } from '../types/game';

interface UserCreationModalProps {
  apiKey: string;
  onCharacterCreated: (character: Character) => void;
  onClose: () => void;
}

export const UserCreationModal: React.FC<UserCreationModalProps> = ({ apiKey, onCharacterCreated, onClose }) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedChar, setGeneratedChar] = useState<Character | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    
    setIsGenerating(true);
    setError('');

    try {
      const newChar = await generateUserCharacter(apiKey, description);
      setGeneratedChar(newChar);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '生成失败，请重试或检查 API Key。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    if (generatedChar) {
      onCharacterCreated(generatedChar);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 text-gray-900 p-4">
      <div className="w-full max-w-lg bg-white border rounded-md p-4">
        <div className="font-semibold mb-2">
          {generatedChar ? '角色生成完成' : '创建角色'}
        </div>

        {generatedChar ? (
          <div className="space-y-3">
            <div>
              <div className="font-medium">{generatedChar.name}</div>
              <div className="text-xs text-gray-600">
                HP {generatedChar.maxHp} / ATK {generatedChar.stats.attack} / DEF {generatedChar.stats.defense}
              </div>
            </div>
            <div className="text-sm text-gray-700">{generatedChar.personality}</div>
            <div className="space-y-1 text-sm">
              {generatedChar.skills.map(skill => (
                <div key={skill.id} className="border rounded p-2">
                  <div className="font-medium">{skill.name}</div>
                  <div className="text-xs text-gray-600">{skill.description}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm text-gray-600">角色描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例如：我是个怕痛的盾娘，喜欢吃甜食..."
              className="w-full h-28 border rounded p-2 text-sm"
              disabled={isGenerating}
            />
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 mt-2">{error}</div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => {
              if (generatedChar) setGeneratedChar(null);
              else onClose();
            }}
            disabled={isGenerating}
            className="border rounded px-3 py-1 text-sm disabled:opacity-50"
          >
            {generatedChar ? '重新生成' : '取消'}
          </button>

          {generatedChar ? (
            <button
              type="button"
              onClick={handleConfirm}
              className="border rounded px-3 py-1 text-sm"
            >
              确认加入
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!description.trim() || isGenerating}
              className="border rounded px-3 py-1 text-sm disabled:opacity-50"
            >
              {isGenerating ? '生成中...' : '开始生成'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
