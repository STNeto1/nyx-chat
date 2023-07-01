import { env } from "~/env";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FC, useState } from "react";
import { Separator } from "~/components/ui/separator";

const usernameSchema = z.object({
  username: z.string(),
});

const sendMessageSchema = z.object({
  action: z.literal("sendmessage"),
  message: z.string(),
});
type Schema = z.infer<typeof sendMessageSchema>;

const receivedMessageSchema = z.object({
  username: z.string(),
  message: z.string(),
  timestamp: z.coerce.date(),
});
const multiMessageSchema = z.array(receivedMessageSchema);
const messageUnionSchema = z.union([receivedMessageSchema, multiMessageSchema]);

type MessageSchema = z.infer<typeof receivedMessageSchema>;

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageSchema[]>([]);

  const { readyState, sendMessage } = useWebSocket(
    env.VITE_APP_API_URL,
    {
      shouldReconnect: () => true,
      onOpen: () => {
        sendMessage(JSON.stringify({ action: "fetchmessages" }));
      },
      onMessage: (event) => {
        if (!username) {
          return;
        }

        const wsMessage = messageUnionSchema.safeParse(JSON.parse(event.data));
        if (!wsMessage.success) {
          console.log(wsMessage.error);
          return;
        }

        if (Array.isArray(wsMessage.data)) {
          setMessages(wsMessage.data);
          return;
        }

        setMessages((prev) => [...prev, wsMessage.data as MessageSchema]);
      },
    },
    Boolean(username) // should connect only if username is set
  );
  const isEnabled = readyState === ReadyState.OPEN;

  const form = useForm<Schema>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      action: "sendmessage",
      message: "",
    },
  });
  const onSubmit = (data: Schema) => {
    sendMessage(JSON.stringify({ ...data, username }));

    form.reset({
      action: "sendmessage",
      message: "",
    });
  };

  return (
    <section className="container max-w-2xl py-10 flex flex-col gap-8">
      {username ? (
        <>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-end gap-4"
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Input placeholder="Your message" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={!isEnabled || form.formState.isSubmitting}
              >
                Submit
              </Button>
            </form>
          </Form>

          <Separator />

          <section className="flex flex-col gap-4">
            {messages.map((elem, idx) => (
              <Message
                key={[elem.username, elem.timestamp, idx.toString()].join("__")}
                {...elem}
              />
            ))}
          </section>
        </>
      ) : (
        <>
          <UsernameForm onComplete={(usr) => setUsername(usr)} />
        </>
      )}
    </section>
  );
}

const Message: FC<MessageSchema> = (props) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">{props.username}: </p>
        <small className="text-sm font-medium leading-none">
          {props.message}
        </small>
      </div>

      <small className="text-sm font-medium leading-none">
        {props.timestamp.toLocaleString()}
      </small>
    </div>
  );
};

const UsernameForm: FC<{ onComplete: (username: string) => void }> = (
  props
) => {
  const form = useForm<Schema>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: "",
    },
  });
  const onSubmit = (data: Schema) => {
    props.onComplete(data.username);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-end gap-4"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Your username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default App;
