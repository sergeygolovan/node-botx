import { Missing, Undefined } from "@missing";
import { UnverifiedPayloadBaseModel } from "@models";

enum ButtonTextAlign {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
}

class Button {
  constructor(
    public label: string,
    public command: Missing<string> = Undefined,
    public data: Record<string, any> = {},
    public textColor: Missing<string> = Undefined,
    public backgroundColor: Missing<string> = Undefined,
    public align: ButtonTextAlign = ButtonTextAlign.CENTER,
    public silent: boolean = true,
    public widthRatio: Missing<number> = Undefined,
    public alert: Missing<string> = Undefined,
    public processOnClient: Missing<boolean> = Undefined,
    public link: Missing<string> = Undefined
  ) {
    if (this.command === Undefined && this.link === Undefined) {
      throw new Error("Either 'command' or 'link' must be provided");
    }
  }
}

type ButtonRow = Button[];

class BaseMarkup {
  private _buttons: ButtonRow[];

  constructor(buttons: ButtonRow[] = []) {
    this._buttons = buttons;
  }

  [Symbol.iterator](): Iterator<ButtonRow> {
    return this._buttons[Symbol.iterator]();
  }

  equals(other: any): boolean {
    if (!(other instanceof BaseMarkup)) {
      throw new Error("Not implemented");
    }

    return this._buttons === other._buttons;
  }

  toString(): string {
    const buttons: string[] = [];

    for (let i = 0; i < this._buttons.length; i++) {
      const rowButtons: string[] = this._buttons[i].map(
        (button) => `${button.label} (${String(button.command)})`
      );
      buttons.push(`row ${i + 1}: ${rowButtons.join(" | ")}`);
    }

    return buttons.join("\n");
  }

  addBuiltButton(button: Button, newRow: boolean = true): void {
    if (newRow) {
      this._buttons.push([button]);
      return;
    }

    if (this._buttons.length === 0) {
      this._buttons.push([]);
    }

    this._buttons[this._buttons.length - 1].push(button);
  }

  addButton(
    label: string,
    command: Missing<string> = Undefined,
    data: { [key: string]: any } = {},
    textColor: Missing<string> = Undefined,
    backgroundColor: Missing<string> = Undefined,
    align: ButtonTextAlign = ButtonTextAlign.CENTER,
    silent: boolean = true,
    widthRatio: Missing<number> = Undefined,
    alert: Missing<string> = Undefined,
    processOnClient: Missing<boolean> = Undefined,
    link: Missing<string> = Undefined,
    newRow: boolean = true
  ): void {
    if (link === Undefined && command === Undefined) {
      throw new Error("Command arg is required if link is undefined.");
    }

    const button = new Button(
      label,
      command,
      data,
      textColor,
      backgroundColor,
      align,
      silent,
      widthRatio,
      alert,
      processOnClient,
      link
    );
    this.addBuiltButton(button, newRow);
  }

  addRow(buttonRow: ButtonRow): void {
    this._buttons.push(buttonRow);
  }
}

class BubbleMarkup extends BaseMarkup {}

class KeyboardMarkup extends BaseMarkup {}

type Markup = BubbleMarkup | KeyboardMarkup;

class BotXAPIButtonOptions extends UnverifiedPayloadBaseModel {
  constructor(
    data: Record<string, any>,
    public silent: Missing<boolean>,
    public font_color: Missing<string>,
    public background_color: Missing<string>,
    public align: Missing<string>,
    public h_size: Missing<number>,
    public show_alert: Missing<boolean>,
    public alert_text: Missing<string>,
    public handler: Missing<string>,
    public link: Missing<string>
  ) {
    super(data);
  }
}

class BotXAPIButton extends UnverifiedPayloadBaseModel {
  constructor(
    command: string,
    label: string,
    data: { [key: string]: any },
    public opts: BotXAPIButtonOptions
  ) {
    super({});
    // Сохраняем значения как приватные свойства, если нужно
    this._command = command;
    this._label = label;
    this._data = data;
  }
  private _command: string;
  private _label: string;
  private _data: { [key: string]: any };
}

class BotXAPIMarkup extends UnverifiedPayloadBaseModel {
  constructor(public __root__: BotXAPIButton[][]) {
    super({});
  }
}

function apiButtonFromDomain(button: Button): BotXAPIButton {
  let showAlert: Missing<boolean> = Undefined;
  if (button.alert !== Undefined) {
    showAlert = true;
  }

  let handler: Missing<string> = Undefined;
  if (button.processOnClient) {
    handler = "client";
  }

  if (button.link !== Undefined) {
    handler = "client";
  }

  return new BotXAPIButton(
    String(button.command),
    String(button.label),
    button.data,
    new BotXAPIButtonOptions(
      {},
      button.silent,
      button.textColor,
      button.backgroundColor,
      button.align,
      button.widthRatio,
      showAlert,
      button.alert,
      handler,
      button.link
    )
  );
}

export { BubbleMarkup, KeyboardMarkup };
