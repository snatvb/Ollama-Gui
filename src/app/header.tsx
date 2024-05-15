import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent } from '@/components/ui/tooltip';
import { TrashIcon } from '@radix-ui/react-icons';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import { SelectModel } from './parts/SelectModel';
import { SideInfoSheet } from './parts/SideInfoSheet';
import { ModeToggle } from '@/components/mode-toggle';
import { core } from '@/core';
import { useSimple } from 'simple-core-state';
import { ConfirmChatClear } from './parts/ConfirmChatClear';
import { memo, useState } from 'react';

export default memo(function Header() {
	const connected = useSimple(core.serverConnected);
	const generating = useSimple(core.generating);
	const lastResponseTime = useSimple(core.lastResponseTime);
	const [showChatClearDialog, setShowChatClearDialog] = useState(false);

	const deleteConversation = () => {
		const conversations = { ...core.conversations._value };

		const currentConversation = core.currentConversation._value;
		// Don't delete the session object but clear instead
		if (currentConversation === 'session') {
			conversations['session'] = {
				chatHistory: [],
				ctx: [],
				model: core.model._value,
			};
		} else {
			// all other conversations will be removed
			delete conversations[currentConversation];
		}

		// Update the core
		core.conversations.set(conversations);

		// Select a new conversation
		const nextId = Object.entries(conversations)?.[0]?.[0] || 'session';
		core.currentConversation.set(nextId);
	};

	return (
		<div className="flex items-center justify-between w-full p-2">
			<div className="flex items-center">
				<div className="h-full flex items-center">
					<Badge variant={connected ? 'secondary' : 'destructive'}>
						{connected ? 'Connected' : 'Disconnected'}
					</Badge>
				</div>

				{lastResponseTime && (
					<div className="ml-2 flex flex-row">
						<p className="font-medium text-black dark:text-white">
							Time taken:
						</p>
						<p className="ml-1 text-neutral-500 ">{lastResponseTime / 1000}s</p>
					</div>
				)}
			</div>

			<div className="flex items-center">
				<Tooltip>
					<TooltipTrigger>
						<Button
							disabled={generating}
							size="default"
							className="w-10 p-0 px-2 ml-2 bg-red-400 hover:bg-red-400 dark:bg-red-500 dark:hover:bg-red-500 dark:text-white hover:opacity-60"
							onClick={() => setShowChatClearDialog(true)}
						>
							<TrashIcon height={21} width={21} />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						<p>Delete Conversation</p>
					</TooltipContent>
				</Tooltip>

				<SelectModel loading={generating} />
				<SideInfoSheet loading={generating} />
				<ModeToggle />
			</div>
			{showChatClearDialog && (
				<ConfirmChatClear
					onClose={(e) => {
						setShowChatClearDialog(false);
						if (e) {
							deleteConversation();
						}
					}}
				/>
			)}
		</div>
	);
});
