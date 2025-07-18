import { Missing, Undefined } from "@missing";
import { UnverifiedPayloadBaseModel } from "@models";
import { IsString, IsBoolean, IsNumber, IsOptional, IsEnum, ValidateNested, IsArray } from "class-validator";
import { Type } from "class-transformer";

enum ButtonTextAlign {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
}

class Button {
  @IsString()
  label: string;

  command: Missing<string>;

  data: Record<string, any>;

  textColor: Missing<string>;

  backgroundColor: Missing<string>;

  @IsEnum(ButtonTextAlign)
  align: ButtonTextAlign;

  @IsBoolean()
  silent: boolean;

  widthRatio: Missing<number>;

  alert: Missing<string>;

  processOnClient: Missing<boolean>;

  link: Missing<string>;

  constructor(
    label: string,
    command: Missing<string> = Undefined,
    data: Record<string, any> = {},
    textColor: Missing<string> = Undefined,
    backgroundColor: Missing<string> = Undefined,
    align: ButtonTextAlign = ButtonTextAlign.CENTER,
    silent: boolean = true,
    widthRatio: Missing<number> = Undefined,
    alert: Missing<string> = Undefined,
    processOnClient: Missing<boolean> = Undefined,
    link: Missing<string> = Undefined
  ) {
    this.label = label;
    this.command = command;
    this.data = data;
    this.textColor = textColor;
    this.backgroundColor = backgroundColor;
    this.align = align;
    this.silent = silent;
    this.widthRatio = widthRatio;
    this.alert = alert;
    this.processOnClient = processOnClient;
    this.link = link;

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

  equals(other: BaseMarkup): boolean {
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
    data: Record<string, unknown> = {},
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

  get buttons(): ButtonRow[] {
    return this._buttons;
  }
}

class BubbleMarkup extends BaseMarkup {}

class KeyboardMarkup extends BaseMarkup {}

type Markup = BubbleMarkup | KeyboardMarkup;

class BotXAPIButtonOptions extends UnverifiedPayloadBaseModel {
  @IsOptional()
  @IsBoolean()
  silent: Missing<boolean>;

  @IsOptional()
  @IsString()
  font_color: Missing<string>;

  @IsOptional()
  @IsString()
  background_color: Missing<string>;

  @IsOptional()
  @IsString()
  align: Missing<string>;

  @IsOptional()
  @IsNumber()
  h_size: Missing<number>;

  @IsOptional()
  @IsBoolean()
  show_alert: Missing<boolean>;

  @IsOptional()
  @IsString()
  alert_text: Missing<string>;

  @IsOptional()
  @IsString()
  handler: Missing<string>;

  @IsOptional()
  @IsString()
  link: Missing<string>;

  constructor(
    data: Record<string, any>,
    silent: Missing<boolean>,
    font_color: Missing<string>,
    background_color: Missing<string>,
    align: Missing<string>,
    h_size: Missing<number>,
    show_alert: Missing<boolean>,
    alert_text: Missing<string>,
    handler: Missing<string>,
    link: Missing<string>
  ) {
    super(data);
    this.silent = silent;
    this.font_color = font_color;
    this.background_color = background_color;
    this.align = align;
    this.h_size = h_size;
    this.show_alert = show_alert;
    this.alert_text = alert_text;
    this.handler = handler;
    this.link = link;
  }
}

class BotXAPIButton extends UnverifiedPayloadBaseModel {
  @IsString()
  command: string;

  @IsString()
  label: string;

  data: Record<string, unknown>;

  @ValidateNested()
  @Type(() => BotXAPIButtonOptions)
  opts: BotXAPIButtonOptions;

  constructor(
    command: string,
    label: string,
    data: Record<string, unknown>,
    opts: BotXAPIButtonOptions
  ) {
    super({});
    this.command = command;
    this.label = label;
    this.data = data;
    this.opts = opts;
  }
}

class BotXAPIMarkup extends UnverifiedPayloadBaseModel {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Array)
  __root__: BotXAPIButton[][];

  constructor(__root__: BotXAPIButton[][]) {
    super({});
    this.__root__ = __root__;
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

function apiMarkupFromDomain(markup: Markup): BotXAPIMarkup {
  return new BotXAPIMarkup(
    markup.buttons.map(buttons => 
      buttons.map(button => apiButtonFromDomain(button))
    )
  );
}

export { BubbleMarkup, KeyboardMarkup, apiMarkupFromDomain };
