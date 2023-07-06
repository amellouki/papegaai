import React, {FunctionComponent} from 'react';
import Textarea from "@/components/BaseFormFields/Textarea";
import ControlledToggleButton from "../BaseFormFields/ControlledToggleButton";
import FormFieldWrapper from "@/components/FormFieldWrapper";
import TextInput from "@/components/BaseFormFields/TextInput";
import Button from "@/components/Button";
import useCreateConversation from "@/hooks/use-create-conversation.hook";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import schema, {InputType} from "./form.schema";
import {getNewConversation} from "./helpers";
import styles from './styles.module.scss';


const CreateConversation: FunctionComponent = () => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: {errors},
    watch,
  } = useForm<InputType>({
    resolver: zodResolver(schema),
  })

  const mutation = useCreateConversation(() => {
    reset();
  })

  const onSubmit: SubmitHandler<InputType> = (data) => mutation.mutate(getNewConversation(data))

  const isRLMCustomPrompt = watch('isRLMCustomPrompt');
  const isCLMCustomPrompt = watch('isCLMCustomPrompt');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.CreateConversation}>
      <FormFieldWrapper
        htmlFor={'conversation-title'}
        label={'Conversation title'}
        fieldError={errors.title}
      >
        <TextInput
          id={'conversation-title'}
          placeholder={'Provide conversation title'}
          hasError={!!errors.title}
          {...register('title', {required: true})}
        />
      </FormFieldWrapper>
      <div className={styles.ToggleButtonRow}>
        <span>Retrieval model prompt</span>
        <Controller
          render={({ field: {onChange, value} }) => (
            <ControlledToggleButton
              id={'rlm'}
              pressed={value}
              onToggle={onChange}
              options={['Default', 'Custom']}
              className={styles.ToggleButton}
            />
          )}
          name={'isRLMCustomPrompt'}
          control={control}
          defaultValue={false}
        />
      </div>
      {isRLMCustomPrompt && (
        <FormFieldWrapper
          htmlFor={'rlm-prompt'}
          label={'Retrieval model prompt'}
          fieldError={errors.rlmPrompt}
        >
          <Textarea
            {...register('rlmPrompt', {required: true})}
            id={'rlm-prompt'}
            aria-invalid={errors.rlmPrompt ? 'true' : 'false'}
            placeholder={'Provide retrieval model prompt'}
            hasError={!!errors.rlmPrompt}
          />
        </FormFieldWrapper>
      )}
      <div className={styles.ToggleButtonRow}>
        <span>Conversational model prompt</span>
        <Controller
          render={({ field: {onChange, value} }) => (
            <ControlledToggleButton
              id={'clm'}
              pressed={value}
              onToggle={onChange}
              options={['Default', 'Custom']}
              className={styles.ToggleButton}
            />
          )}
          name={'isCLMCustomPrompt'}
          control={control}
          defaultValue={false}
        />
      </div>
      {isCLMCustomPrompt && (
        <FormFieldWrapper
          htmlFor={'clm-prompt'}
          label={'Conversational model prompt'}
          fieldError={errors.clmPrompt}
        >
          <Textarea
            {...register('clmPrompt', {required: true})}
            id={'clm-prompt'}
            placeholder={'Provide conversational model prompt'}
            hasError={!!errors.clmPrompt}
          />
        </FormFieldWrapper>
      )}
      <Button type={'submit'} className={styles.SubmitButton}>Create</Button>
    </form>
  );
}

export default CreateConversation;
