import React, {useRef} from "react";
import QueryForm from "@/components/QueryForm";
import ChatThread from "@/components/ChatThread";
import useChatHistory from "@/hooks/use-chat-history.hook";
import useConversation from "@/hooks/use-conversation.hook";
import {useRouter} from "next/router";
import styles from "./styles.module.scss";
import useConversations from "@/hooks/use-conversations.hook";
import SelectBot from "../../components/SelectBot";

const Conversation: React.FC = () => {
  const router = useRouter()
  const conversationId = parseInt(router.query.conversationId as string)
  const [newlyCreatedConversationId, setNewlyCreatedConversationId] = React.useState<number>()

  const {data, isLoading} = useConversations(conversationId || newlyCreatedConversationId)
  const {history, appendOptimistic, appendSuccess} = useChatHistory(data?.chatHistory);
  const {response, sendQuestion, resources} = useConversation(
    (question) => {
      appendSuccess(question)
    },
    (response) => {
      appendSuccess(response)
    },
    (id) => setNewlyCreatedConversationId(id)
  );

  const botSelectionRef = useRef()

  if (isLoading) {
    return <center>Loading...</center>
  }

  return (
    <div className={styles.Conversation}>
      {(!isLoading && !data) && <SelectBot botSelectionRef={botSelectionRef}/>}
      {(data) && <h1>{conversationId}</h1>}
      <ChatThread chatHistory={history} response={response}/>
      <QueryForm className={styles.queryForm} onSubmit={(question: string) => {
        const id = data?.id || newlyCreatedConversationId
        appendOptimistic({
          content: question,
          type: 'question',
          fromId: 0,
          fromType: 'human',
        });
        sendQuestion(
          question,
          conversationId || newlyCreatedConversationId,
          newlyCreatedConversationId ? undefined : botSelectionRef.current
        );
      }}/>
      {data?.document && <div><em>Retrieving data from <strong>{data.document.title}</strong></em></div>}
    </div>
  );
};

export default Conversation;
