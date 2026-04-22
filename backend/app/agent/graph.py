from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode
from langchain_openai import AzureChatOpenAI
from app.config import settings
from .tools import create_calendar_note_tool, enroll_student_tool, unenroll_student_tool

# 1. Setup the LLM with your Azure credentials
llm = AzureChatOpenAI(
    azure_deployment=settings.AZURE_OPENAI_DEPLOYMENT,
    openai_api_version=settings.AZURE_OPENAI_API_VERSION,
    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
    api_key=settings.AZURE_OPENAI_API_KEY,
)

tools = [enroll_student_tool, unenroll_student_tool, create_calendar_note_tool]
llm_with_tools = llm.bind_tools(tools)

# 2. Define the nodes
def call_model(state: MessagesState):
    # This is where your SYSTEM_PROMPT goes
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}

def router(state: MessagesState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

# 3. Compile the Graph
workflow = StateGraph(MessagesState)
workflow.add_node("agent", call_model)
workflow.add_node("tools", ToolNode(tools))

workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", router)
workflow.add_edge("tools", "agent")

agent_executor = workflow.compile()
