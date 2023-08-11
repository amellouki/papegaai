import React, {FunctionComponent, useEffect, useMemo} from 'react';
import {useQuery} from "react-query";
import {Bot} from "@my-monorepo/shared";
import useEmbeddedDocumentsList from "@/hooks/use-embedded-document-list.hook";
import {Controller, useForm} from "react-hook-form";
import {DocumentMetadata} from "@my-monorepo/shared";
import {Select} from "@/components/BaseFormFields/Select";
import SelectOption from "@/types/SelectOption";
import styles from './styles.module.scss'

export type BotSelection = {
  botId: number;
  documentId?: number;
}

type Props = {
  botSelectionRef: React.MutableRefObject<BotSelection | undefined>;
}

const SelectBot: FunctionComponent<Props> = ({ botSelectionRef }) => {
  const {data: botsData} = useQuery<Bot[]>('bots', () => {
    return fetch(process.env.NEXT_PUBLIC_BACKEND_API + '/bot/get-bots').then((res) => res.json())
  });

  const botsOptions = useMemo(() => {
    console.log(botsData)
    return botsData?.map((bot) => ({
      label: bot.name,
      value: bot.id + ''
    })) ?? [];
  }, [botsData]);

  const botsMap = useMemo(() => {
    return new Map(botsData?.map(option => [option.id, option]))
  }, [botsData])

  const {data: documentsData} = useEmbeddedDocumentsList();

  const documentsOptions = useMemo(() => {
    return documentsData?.map((document) => ({
      label: document.title,
      value: document.id + ''
    })) ?? [];
  }, [documentsData]);

  const documentsMap = useMemo(() => {
    return new Map(documentsData?.map(option => [option.id, option]))
  }, [documentsData])

  const {control, watch, formState: { errors }} = useForm<BotSelection>({ mode: 'onChange' })
  const watchAllFields = watch();
  useEffect(() => {
    botSelectionRef.current = watchAllFields;
  }, [botSelectionRef, watchAllFields, errors]);

  return (
    <div className={styles.SelectBot}>
      <Controller
        render={({field: {onChange, value}}) => (
          <Select
            id={'bot'}
            className={styles.select}
            options={botsOptions}
            onChange={(selected) => selected && onChange(parseInt(selected.value))}
            selected={botToSelected(value, botsMap)}
          />
        )}
        name={'botId'}
        control={control}
      />
      <Controller
        render={({field: {onChange, value}}) => (
          <Select
            id={'document'}
            className={styles.select}
            options={documentsOptions}
            onChange={(selected) => selected && onChange(parseInt(selected.value))}
            selected={documentToSelected(value, documentsMap)}
          />
        )}
        name={'documentId'}
        control={control}
      />
    </div>
  );
}

function botToSelected(id: number | undefined, optionsMap: Map<number, Bot>): SelectOption | undefined {
  if (!id) {
    return undefined;
  }
  const bot = optionsMap.get(id);
  return bot ? {
    label: bot.name,
    value: bot.id + ''
  } : undefined;
}

function documentToSelected(id: number | undefined, optionsMap: Map<number, DocumentMetadata>): SelectOption | undefined {
  if (!id) {
    return undefined;
  }
  const document = optionsMap.get(id);
  return document ? {
    label: document.title,
    value: document.id + ''
  } : undefined;
}

export default SelectBot;
