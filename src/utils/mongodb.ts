import mongoose from 'mongoose';
import { Guild } from '../types';
import { logger } from './tools';

const { MONGODB_URI = '' } = process.env;

class Mongodb {
  private schema = new mongoose.Schema({
    guildId: { type: String, required: true },
    gptChannelId: { type: String },
    gpt4ChannelId: { type: String },
    imageChannelId: { type: String },
  });

  private guildModel = mongoose.model<Guild>('Guild', this.schema);

  public async connect() {
    try {
      await mongoose.connect(MONGODB_URI);
      await logger(`DB is connected!`);
    } catch (error) {
      console.log(error);
    }
  }

  async create(data: Guild) {
    const guild = new this.guildModel(data);

    return guild.save();
  }

  async findOne(guildId: string) {
    return this.guildModel.findOne({ guildId }).exec();
  }

  public async getClientGuild(guildId: string) {
    let guild = await this.findOne(guildId);

    if (!guild) {
      guild = await this.create({ guildId });
    }

    return guild;
  }

  public async update(id: string, data: Partial<Omit<Guild, '_id' | 'guildId'>>) {
    return this.guildModel
      .findByIdAndUpdate(id, data, {
        returnDocument: 'after',
      })
      .exec();
  }
}

export const mongoDB = new Mongodb();
