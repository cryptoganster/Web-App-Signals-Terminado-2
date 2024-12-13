import { TradingSignal } from '../types/signal';
import { User } from '../types/auth';

interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
  };
  description?: string;
}

export class TelegramService {
  constructor(
    private botToken: string,
    private chatId: string,
    private topicId: number,
    private activationTopicId: number,
    private signalListTopicId: number
  ) {}

  private async sendMessage(
    text: string,
    parseMode: 'HTML' | 'MarkdownV2' = 'MarkdownV2',
    messageThreadId: number = this.topicId,
    replyToMessageId?: number
  ): Promise<{ success: boolean; messageId?: number }> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          message_thread_id: messageThreadId,
          text,
          parse_mode: parseMode,
          reply_to_message_id: replyToMessageId
        }),
      });

      const data: TelegramResponse = await response.json();

      if (!data.ok) {
        console.error('Failed to send Telegram message:', data);
        return { success: false };
      }

      return {
        success: true,
        messageId: data.result?.message_id
      };
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return { success: false };
    }
  }

  private escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }

  private formatMonoHTML(text: string): string {
    return `<code>${text}</code>`;
  }

  private formatMonoMarkdown(text: string): string {
    return `\`${this.escapeMarkdown(text)}\``;
  }

  private formatBoldHTML(text: string): string {
    return `<b>${text}</b>`;
  }

  private formatBoldMarkdown(text: string): string {
    return `**${this.escapeMarkdown(text)}**`;
  }

  private getMessageUrl(messageId: number): string {
    return `https://t.me/c/${this.chatId.slice(4)}/${messageId}`;
  }

  async sendSignalNotification(signal: TradingSignal, user: User): Promise<{ success: boolean; messageId?: number }> {
    const entries = signal.entries.map(entry => `• ${this.formatMonoHTML(entry.price)}`).join('\n');
    const stopLosses = signal.stopLosses.map(sl => `• ${this.formatMonoHTML(sl.price)}`).join('\n');
    const takeProfits = signal.takeProfits.map(tp => `• ${this.formatMonoHTML(tp.price)}`).join('\n');

    let message = `📍 ${this.formatBoldHTML('New Trading Signal')}
👤 ${this.formatBoldHTML('Trader:')} ${user.username}

💎 ${this.formatBoldHTML('Pair:')} ${signal.pair}
🕹️ ${this.formatBoldHTML('Type:')} ${signal.type}
📊 ${this.formatBoldHTML('Position:')} ${signal.position}`;

    if (signal.leverage) {
      message += `\n🏛️ ${this.formatBoldHTML('Leverage:')} ${signal.leverage}x`;
    }

    message += `\n\n🎯 ${this.formatBoldHTML('Entry:')}\n${entries}
🛑 ${this.formatBoldHTML('Stop Loss:')}\n${stopLosses}
✅ ${this.formatBoldHTML('Take Profit:')}\n${takeProfits}`;

    if (signal.riskReward) {
      message += `\n\n🧩 ${this.formatBoldHTML('Reward:')} ${signal.riskReward}`;
    }

    if (signal.comments) {
      message += `\n💭 ${this.formatBoldHTML('Comments:')} ${signal.comments}`;
    }

    if (signal.tradingViewUrl) {
      message += `\n📊 ${this.formatBoldHTML('Chart:')} ${signal.tradingViewUrl}`;
    }

    return this.sendMessage(message, 'HTML');
  }

  async sendSignalModification(
    signal: TradingSignal,
    user: User,
    changes: any,
    replyToMessageId?: number
  ): Promise<{ success: boolean; messageId?: number }> {
    let message = `📍 ${this.formatBoldMarkdown('Signal Modification')}
👤 ${this.formatBoldMarkdown('Trader:')} ${this.escapeMarkdown(user.username)}

💎 ${this.formatBoldMarkdown('Pair:')} ${this.escapeMarkdown(signal.pair)}
🕹️ ${this.formatBoldMarkdown('Type:')} ${this.escapeMarkdown(signal.type)}
📊 ${this.formatBoldMarkdown('Position:')} ${this.escapeMarkdown(signal.position)}`;

    if (changes.entries.length > 0) {
      message += '\n\n🎯 ';
      changes.entries.forEach((change: any) => {
        if (change.type === 'changed') {
          message += `${this.formatBoldMarkdown(`Entry ${change.index + 1}`)} was changed from ${this.formatMonoMarkdown(change.oldPrice)} to ${this.formatMonoMarkdown(change.newPrice)}\n`;
        } else if (change.type === 'added') {
          message += `${this.formatBoldMarkdown(`Entry ${change.index + 1}`)} was added ${this.formatMonoMarkdown(change.newPrice)}\n`;
        } else if (change.type === 'deleted') {
          message += `${this.formatBoldMarkdown(`Entry ${change.index + 1}`)} was deleted\n`;
        }
      });
    }

    if (changes.stopLosses.length > 0) {
      message += '\n🛑 ';
      changes.stopLosses.forEach((change: any) => {
        if (change.type === 'changed') {
          message += `${this.formatBoldMarkdown(`Stop Loss ${change.index + 1}`)} was changed from ${this.formatMonoMarkdown(change.oldPrice)} to ${this.formatMonoMarkdown(change.newPrice)}\n`;
        } else if (change.type === 'added') {
          message += `${this.formatBoldMarkdown(`Stop Loss ${change.index + 1}`)} was added ${this.formatMonoMarkdown(change.newPrice)}\n`;
        } else if (change.type === 'deleted') {
          message += `${this.formatBoldMarkdown(`Stop Loss ${change.index + 1}`)} was deleted\n`;
        }
      });
    }

    if (changes.takeProfits.length > 0) {
      message += '\n✅ ';
      changes.takeProfits.forEach((change: any) => {
        if (change.type === 'changed') {
          message += `${this.formatBoldMarkdown(`Take Profit ${change.index + 1}`)} was changed from ${this.formatMonoMarkdown(change.oldPrice)} to ${this.formatMonoMarkdown(change.newPrice)}\n`;
        } else if (change.type === 'added') {
          message += `${this.formatBoldMarkdown(`Take Profit ${change.index + 1}`)} was added ${this.formatMonoMarkdown(change.newPrice)}\n`;
        } else if (change.type === 'deleted') {
          message += `${this.formatBoldMarkdown(`Take Profit ${change.index + 1}`)} was deleted\n`;
        }
      });
    }

    if (signal.riskReward) {
      message += `\n🧩 ${this.formatBoldMarkdown('Reward:')} ${this.escapeMarkdown(signal.riskReward)}`;
    }

    if (signal.comments) {
      message += `\n💭 ${this.formatBoldMarkdown('Comments:')} ${this.escapeMarkdown(signal.comments)}`;
    }

    if (signal.tradingViewUrl) {
      message += `\n📊 ${this.formatBoldMarkdown('Chart:')} ${this.escapeMarkdown(signal.tradingViewUrl)}`;
    }

    return this.sendMessage(message, 'MarkdownV2', this.topicId, replyToMessageId);
  }

  async sendActivationNotification(
    signal: TradingSignal,
    user: User,
    activationType: 'manual' | 'automatic',
    price: string,
    replyToMessageId?: number
  ): Promise<{ success: boolean; messageId?: number }> {
    const messageId = signal.lastModificationId || signal.telegramMessageId;
    const signalText = `${this.escapeMarkdown(signal.pair)} ${this.escapeMarkdown(signal.position.toUpperCase())}`;
    const signalLink = messageId ? `[${signalText}](${this.getMessageUrl(messageId)})` : signalText;

    const activationText = activationType === 'manual' ? 'manually activated' : 'automatically activated';
    const message = `🎯 ${signalLink} from ${this.formatBoldMarkdown(this.escapeMarkdown(user.username))} has been ${this.formatBoldMarkdown(activationText)} at ${this.formatMonoMarkdown(price)}`;

    return this.sendMessage(message, 'MarkdownV2', this.activationTopicId);
  }

  async sendHitNotification(
    signal: TradingSignal,
    user: User,
    updateType: 'takeProfit' | 'stopLoss' | 'completed' | 'entry',
    targetIndex?: number,
    replyToMessageId?: number
  ): Promise<{ success: boolean; messageId?: number }> {
    const messageId = signal.lastModificationId || signal.telegramMessageId;
    const signalText = `${this.escapeMarkdown(signal.pair)} ${this.escapeMarkdown(signal.position.toUpperCase())}`;
    const signalLink = messageId ? `[${signalText}](${this.getMessageUrl(messageId)})` : signalText;

    let hitText = '';
    let price = '';

    switch (updateType) {
      case 'takeProfit':
        hitText = this.formatBoldMarkdown(`Take Profit ${targetIndex}`);
        price = signal.takeProfits[targetIndex! - 1].price;
        break;
      case 'stopLoss':
        hitText = this.formatBoldMarkdown(`Stop Loss ${targetIndex}`);
        price = signal.stopLosses[targetIndex! - 1].price;
        break;
      case 'entry':
        hitText = this.formatBoldMarkdown(`Entry ${targetIndex}`);
        price = signal.entries[targetIndex! - 1].price;
        break;
      case 'completed':
        hitText = this.formatBoldMarkdown('all Take Profits');
        price = signal.takeProfits[signal.takeProfits.length - 1].price;
        break;
    }

    const message = `🎯 ${signalLink} from ${this.formatBoldMarkdown(this.escapeMarkdown(user.username))} has hit ${hitText} at ${this.formatMonoMarkdown(price)}`;

    return this.sendMessage(message, 'MarkdownV2', this.activationTopicId);
  }

  async sendCancelNotification(
    signal: TradingSignal,
    user: User,
    replyToMessageId?: number
  ): Promise<{ success: boolean; messageId?: number }> {
    const messageId = signal.lastModificationId || signal.telegramMessageId;
    const signalText = `${this.escapeMarkdown(signal.pair)} ${this.escapeMarkdown(signal.position.toUpperCase())}`;
    const signalLink = messageId ? `[${signalText}](${this.getMessageUrl(messageId)})` : signalText;

    const message = `🎯 ${signalLink} from ${this.formatBoldMarkdown(this.escapeMarkdown(user.username))} has been ${this.formatBoldMarkdown('canceled')} without any entry`;

    return this.sendMessage(message, 'MarkdownV2', this.activationTopicId);
  }

  async sendSignalListNotification(
    activeSignals: TradingSignal[],
    pendingSignals: TradingSignal[]
  ): Promise<{ success: boolean; messageId?: number }> {
    const formatSignalLine = (signal: TradingSignal) => {
      const messageId = signal.lastModificationId || signal.telegramMessageId;
      const signalText = `${this.escapeMarkdown(signal.pair)} ${this.escapeMarkdown(signal.position.toUpperCase())}`;
      const signalLink = messageId ? `[${signalText}](${this.getMessageUrl(messageId)})` : signalText;

      // Get the last hit take profit index
      const lastHitTpIndex = signal.status.startsWith('take-profit-') 
        ? parseInt(signal.status.split('-')[2]) 
        : 0;

      // Format entries in a single line
      const entries = signal.entries
        .map(e => `• ${this.formatMonoMarkdown(e.price)}`)
        .join(' ');

      // Format stop losses in a single line
      const stopLosses = signal.stopLosses
        .map(sl => `• ${this.formatMonoMarkdown(sl.price)}`)
        .join(' ');
      
      // Format take profits in a single line with checkmark
      const takeProfits = signal.takeProfits
        .map((tp, index) => {
          const price = this.formatMonoMarkdown(tp.price);
          return `• ${price}${index + 1 === lastHitTpIndex ? ' ✔️' : ''}`;
        })
        .join(' ');

      const username = this.escapeMarkdown(signal.user?.username || 'unknown');

      return `• ${signalLink}\nEntry ${entries}\nSL ${stopLosses}\nTP ${takeProfits}\n👤 ${username}\n`;
    };

    const activeSignalsText = activeSignals.length > 0 
      ? activeSignals.map(formatSignalLine).join('\n')
      : '• N/A\n';

    const pendingSignalsText = pendingSignals.length > 0
      ? pendingSignals.map(formatSignalLine).join('\n')
      : '• N/A\n';

    const message = `🎯 ${this.formatBoldMarkdown('Active Signals')} \\(opened orders\\)\n\n${activeSignalsText}\n⏰ ${this.formatBoldMarkdown('Pending Signals')} \\(waiting to open\\)\n\n${pendingSignalsText}`;

    return this.sendMessage(message, 'MarkdownV2', this.signalListTopicId);
  }
}