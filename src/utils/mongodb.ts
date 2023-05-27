import mongoose from 'mongoose';
import { Guild } from '../types';
import { logger } from './tools';

const { MONGODB_URI = '' } = process.env;

const schema = new mongoose.Schema({
  guildId: { type: String, required: true },
  gptChannelId: { type: String },
  gpt4ChannelId: { type: String },
  imageChannelId: { type: String },
});

export const GuildModel = mongoose.model<Guild>('Guild', schema);
export async function mongoConnect() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger(`DB is connected!`);
  } catch (error) {
    console.log(error);
  }
}

export async function create(data: Guild) {
  const guild = new GuildModel(data);

  return guild.save();
}

export async function update(id: string, data: Partial<Omit<Guild, '_id' | 'guildId'>>) {
  return GuildModel.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
  }).exec();
}

export async function findOne(guildId: string) {
  return GuildModel.findOne({ guildId }).exec();
}

export async function init(guildId: string) {
  let guild = await findOne(guildId);

  if (!guild) {
    guild = await create({ guildId });
  }

  return guild;
}
